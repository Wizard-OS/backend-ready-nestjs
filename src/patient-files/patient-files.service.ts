import {
  BadRequestException,
  InternalServerErrorException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Express } from 'express';
import { promises as fs } from 'fs';
import * as path from 'path';

import { Patient } from '../patients/entities/patient.entity';
import { Treatment } from '../treatments/entities/treatment.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { ClinicalNote } from '../clinical-notes/entities/clinical-note.entity';
import { PatientFile } from './entities/patient-file.entity';
import { CreatePatientFileDto } from './dto/create-patient-file.dto';
import { PatientFileType } from './interfaces/patient-file-type.enum';
import {
  ClinicAccessContext,
  PatientAccessService,
} from '../patients/services/patient-access.service';
import { MembershipService } from '../membership/membership.service';

@Injectable()
export class PatientFilesService {
  constructor(
    @InjectRepository(PatientFile)
    private readonly patientFileRepository: Repository<PatientFile>,

    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,

    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,

    @InjectRepository(ClinicalNote)
    private readonly clinicalNoteRepository: Repository<ClinicalNote>,

    @InjectRepository(Treatment)
    private readonly treatmentRepository: Repository<Treatment>,

    private readonly patientAccessService: PatientAccessService,

    private readonly membershipService: MembershipService,
  ) {}

  async create(
    context: ClinicAccessContext,
    patientId: string,
    uploadedByMembershipId: string,
    file: Express.Multer.File,
    baseUrl: string,
    dto: CreatePatientFileDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    this.patientAccessService.assertCanManageClinical(context);
    await this.patientAccessService.assertPatientAccessible(context, patientId);

    try {
      await this.membershipService.assertCanStoreFile(
        context.clinicId,
        file.size,
      );
    } catch (error) {
      await fs.unlink(file.path).catch(() => undefined);
      throw error;
    }

    if (dto.appointmentId) {
      await this.assertAppointmentForPatient(
        dto.appointmentId,
        patientId,
        context.clinicId,
      );
    }

    if (dto.clinicalNoteId) {
      await this.assertClinicalNoteForPatient(
        dto.clinicalNoteId,
        patientId,
        context.clinicId,
      );
    }

    if (dto.treatmentId) {
      await this.assertTreatmentForPatient(
        dto.treatmentId,
        patientId,
        context.clinicId,
      );
    }

    const patientFile = this.patientFileRepository.create({
      patientId,
      appointmentId: dto.appointmentId ?? null,
      clinicalNoteId: dto.clinicalNoteId ?? null,
      treatmentId: dto.treatmentId ?? null,
      uploadedByMembershipId,
      type: dto.type ?? this.inferFileType(file.mimetype),
      description: dto.description ?? null,
      originalName: file.originalname,
      storedName: file.filename,
      path: file.path,
      url: `${baseUrl}/uploads/patient-files/${file.filename}`,
      mimeType: file.mimetype,
      size: file.size,
    });

    return await this.patientFileRepository.save(patientFile);
  }

  async findAllByPatient(context: ClinicAccessContext, patientId: string) {
    await this.patientAccessService.assertPatientAccessible(context, patientId);

    return await this.patientFileRepository.find({
      where: { patientId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(context: ClinicAccessContext, id: string) {
    const patientFile = await this.patientFileRepository
      .createQueryBuilder('file')
      .innerJoin('file.patient', 'patient')
      .where('file.id = :id', { id })
      .andWhere('patient.clinicId = :clinicId', {
        clinicId: context.clinicId,
      })
      .getOne();

    if (!patientFile) {
      throw new NotFoundException(`Patient file ${id} not found`);
    }

    await this.patientAccessService.assertPatientAccessible(
      context,
      patientFile.patientId,
    );

    return patientFile;
  }

  async remove(context: ClinicAccessContext, id: string) {
    this.patientAccessService.assertCanManageClinical(context);
    const patientFile = await this.findOne(context, id);
    await this.deleteStoredFile(patientFile.storedName);
    await this.patientFileRepository.softRemove(patientFile);
    return { message: `Patient file ${id} deleted` };
  }

  private inferFileType(mimeType: string): PatientFileType {
    if (mimeType.startsWith('image/')) return PatientFileType.IMAGE;
    if (mimeType === 'application/pdf') return PatientFileType.PDF;
    return PatientFileType.OTHER;
  }

  private async deleteStoredFile(storedName: string) {
    const uploadDir = path.resolve(process.cwd(), 'uploads', 'patient-files');
    const filePath = path.resolve(uploadDir, storedName);

    if (!filePath.startsWith(`${uploadDir}${path.sep}`)) {
      throw new BadRequestException('Invalid stored file path');
    }

    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (
        error instanceof Object &&
        'code' in error &&
        error.code === 'ENOENT'
      ) {
        return;
      }

      throw new InternalServerErrorException(
        'Could not delete stored patient file',
      );
    }
  }

  private async assertPatientInClinic(patientId: string, clinicId: string) {
    const patient = await this.patientRepository.findOne({
      where: { id: patientId, clinicId },
      select: { id: true },
    });

    if (!patient) {
      throw new NotFoundException(
        `Patient ${patientId} does not belong to the requested clinic`,
      );
    }
  }

  private async assertAppointmentForPatient(
    appointmentId: string,
    patientId: string,
    clinicId: string,
  ) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId, patientId, clinicId },
      select: { id: true },
    });

    if (!appointment) {
      throw new BadRequestException(
        'Appointment does not belong to patient and clinic scope',
      );
    }
  }

  private async assertClinicalNoteForPatient(
    clinicalNoteId: string,
    patientId: string,
    clinicId: string,
  ) {
    const note = await this.clinicalNoteRepository
      .createQueryBuilder('note')
      .innerJoin('note.clinicalRecord', 'record')
      .innerJoin('record.patient', 'patient')
      .where('note.id = :clinicalNoteId', { clinicalNoteId })
      .andWhere('record.patientId = :patientId', { patientId })
      .andWhere('patient.clinicId = :clinicId', { clinicId })
      .getOne();

    if (!note) {
      throw new BadRequestException(
        'Clinical note does not belong to patient and clinic scope',
      );
    }
  }

  private async assertTreatmentForPatient(
    treatmentId: string,
    patientId: string,
    clinicId: string,
  ) {
    const treatment = await this.treatmentRepository
      .createQueryBuilder('treatment')
      .innerJoin('treatment.patient', 'patient')
      .where('treatment.id = :treatmentId', { treatmentId })
      .andWhere('treatment.patientId = :patientId', { patientId })
      .andWhere('patient.clinicId = :clinicId', { clinicId })
      .getOne();

    if (!treatment) {
      throw new BadRequestException(
        'Treatment does not belong to patient and clinic scope',
      );
    }
  }
}
