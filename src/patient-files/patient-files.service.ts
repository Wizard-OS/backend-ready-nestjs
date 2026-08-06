import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Express } from 'express';
import { promises as fs } from 'fs';
import * as path from 'path';
import { createHash, randomUUID } from 'crypto';
import { Readable } from 'stream';

import { Patient } from '../patients/entities/patient.entity';
import { Treatment } from '../treatments/entities/treatment.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { ClinicalNote } from '../clinical-notes/entities/clinical-note.entity';
import { PatientFile } from './entities/patient-file.entity';
import { CreatePatientFileDto } from './dto/create-patient-file.dto';
import { PatientFileStorageStatus } from './interfaces/patient-file-storage-status.enum';
import { PatientFileSyncSource } from './interfaces/patient-file-sync-source.enum';
import { PatientFileType } from './interfaces/patient-file-type.enum';
import {
  ClinicAccessContext,
  PatientAccessService,
} from '../patients/services/patient-access.service';
import { MembershipService } from '../membership/membership.service';
import { StorageProviderType } from '../storage/interfaces/storage-provider-type.enum';
import { StorageService } from '../storage/storage.service';

export interface GeneratedPatientFileInput {
  originalName: string;
  path: string;
  mimeType: string;
  size: number;
  type: PatientFileType;
  description?: string;
  appointmentId?: string | null;
  clinicalNoteId?: string | null;
  treatmentId?: string | null;
}

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

    private readonly storageService: StorageService,
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
    const patient = await this.findPatientInClinic(patientId, context.clinicId);

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

    const patientFileId = randomUUID();
    const fileType = dto.type ?? this.inferFileType(file.mimetype);
    const checksum = await this.calculateChecksum(file.path);
    let storageResult;

    try {
      storageResult = await this.storageService.upload({
        clinicId: context.clinicId,
        clinicName: patient.clinic.name,
        patient,
        fileId: patientFileId,
        file,
        type: fileType,
        checksum,
        baseUrl,
        relation: {
          appointmentId: dto.appointmentId ?? null,
          clinicalNoteId: dto.clinicalNoteId ?? null,
          treatmentId: dto.treatmentId ?? null,
        },
      });
    } catch (error) {
      await fs.unlink(file.path).catch(() => undefined);
      throw error;
    }

    if (storageResult.storageProvider === StorageProviderType.GOOGLE_DRIVE) {
      await fs.unlink(file.path).catch(() => undefined);
    }

    const patientFile = this.patientFileRepository.create({
      id: patientFileId,
      patientId,
      appointmentId: dto.appointmentId ?? null,
      clinicalNoteId: dto.clinicalNoteId ?? null,
      treatmentId: dto.treatmentId ?? null,
      uploadedByMembershipId,
      type: fileType,
      description: dto.description ?? null,
      originalName: file.originalname,
      storedName: storageResult.storedName,
      path: storageResult.path,
      url: storageResult.url,
      mimeType: storageResult.mimeType,
      size: storageResult.size,
      storageProvider: storageResult.storageProvider,
      storageStatus: PatientFileStorageStatus.AVAILABLE,
      syncSource: PatientFileSyncSource.APP,
      driveFileId: storageResult.driveFileId ?? null,
      driveFolderId: storageResult.driveFolderId ?? null,
      checksum,
      driveModifiedAt: storageResult.driveModifiedAt ?? null,
      externalMetadataJson: storageResult.externalMetadataJson ?? {},
    });

    return await this.patientFileRepository.save(patientFile);
  }

  async createGenerated(
    context: ClinicAccessContext,
    patientId: string,
    uploadedByMembershipId: string,
    baseUrl: string,
    input: GeneratedPatientFileInput,
  ) {
    this.patientAccessService.assertCanManageClinical(context);
    await this.patientAccessService.assertPatientAccessible(context, patientId);
    const patient = await this.findPatientInClinic(patientId, context.clinicId);

    try {
      await this.membershipService.assertCanStoreFile(
        context.clinicId,
        input.size,
      );

      if (input.appointmentId) {
        await this.assertAppointmentForPatient(
          input.appointmentId,
          patientId,
          context.clinicId,
        );
      }

      if (input.clinicalNoteId) {
        await this.assertClinicalNoteForPatient(
          input.clinicalNoteId,
          patientId,
          context.clinicId,
        );
      }

      if (input.treatmentId) {
        await this.assertTreatmentForPatient(
          input.treatmentId,
          patientId,
          context.clinicId,
        );
      }

      const patientFileId = randomUUID();
      const checksum = await this.calculateChecksum(input.path);
      const file = this.toGeneratedMulterFile(input);
      const storageResult = await this.storageService.upload({
        clinicId: context.clinicId,
        clinicName: patient.clinic.name,
        patient,
        fileId: patientFileId,
        file,
        type: input.type,
        checksum,
        baseUrl,
        relation: {
          appointmentId: input.appointmentId ?? null,
          clinicalNoteId: input.clinicalNoteId ?? null,
          treatmentId: input.treatmentId ?? null,
        },
      });

      if (storageResult.storageProvider === StorageProviderType.GOOGLE_DRIVE) {
        await fs.unlink(input.path).catch(() => undefined);
      }

      const patientFile = this.patientFileRepository.create({
        id: patientFileId,
        patientId,
        appointmentId: input.appointmentId ?? null,
        clinicalNoteId: input.clinicalNoteId ?? null,
        treatmentId: input.treatmentId ?? null,
        uploadedByMembershipId,
        type: input.type,
        description: input.description ?? null,
        originalName: input.originalName,
        storedName: storageResult.storedName,
        path: storageResult.path,
        url: storageResult.url,
        mimeType: storageResult.mimeType,
        size: storageResult.size,
        storageProvider: storageResult.storageProvider,
        storageStatus: PatientFileStorageStatus.AVAILABLE,
        syncSource: PatientFileSyncSource.APP,
        driveFileId: storageResult.driveFileId ?? null,
        driveFolderId: storageResult.driveFolderId ?? null,
        checksum,
        driveModifiedAt: storageResult.driveModifiedAt ?? null,
        externalMetadataJson: storageResult.externalMetadataJson ?? {},
      });

      return await this.patientFileRepository.save(patientFile);
    } catch (error) {
      await fs.unlink(input.path).catch(() => undefined);
      throw error;
    }
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
    await this.storageService.markUnavailable(patientFile.storageProvider, {
      clinicId: context.clinicId,
      storedName: patientFile.storedName,
      driveFileId: patientFile.driveFileId,
    });

    if (patientFile.storageProvider === StorageProviderType.GOOGLE_DRIVE) {
      patientFile.storageStatus = PatientFileStorageStatus.UNAVAILABLE;
      patientFile.syncSource = PatientFileSyncSource.DRIVE_UPDATE;
      await this.patientFileRepository.save(patientFile);
    } else {
      await this.patientFileRepository.softRemove(patientFile);
    }

    return { message: `Patient file ${id} deleted` };
  }

  private inferFileType(mimeType: string): PatientFileType {
    if (mimeType.startsWith('image/')) return PatientFileType.IMAGE;
    if (mimeType === 'application/pdf') return PatientFileType.PDF;
    return PatientFileType.OTHER;
  }

  private async calculateChecksum(filePath: string): Promise<string> {
    const hash = createHash('sha256');
    const content = await fs.readFile(filePath);
    hash.update(content);
    return hash.digest('hex');
  }

  private toGeneratedMulterFile(
    input: GeneratedPatientFileInput,
  ): Express.Multer.File {
    return {
      fieldname: 'file',
      originalname: input.originalName,
      encoding: '7bit',
      mimetype: input.mimeType,
      size: input.size,
      destination: path.dirname(input.path),
      filename: path.basename(input.path),
      path: input.path,
      buffer: Buffer.alloc(0),
      stream: Readable.from([]),
    };
  }

  private async findPatientInClinic(
    patientId: string,
    clinicId: string,
  ): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { id: patientId, clinicId },
      relations: { clinic: true },
    });

    if (!patient) {
      throw new NotFoundException(
        `Patient ${patientId} does not belong to the requested clinic`,
      );
    }

    return patient;
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
