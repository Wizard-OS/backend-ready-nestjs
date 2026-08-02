import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Patient } from '../patients/entities/patient.entity';
import { Treatment } from '../treatments/entities/treatment.entity';
import { ClinicalNote } from '../clinical-notes/entities/clinical-note.entity';
import { OdontogramEntry } from './entities/odontogram-entry.entity';
import { UpdateOdontogramToothDto } from './dto/update-odontogram-tooth.dto';
import {
  ClinicAccessContext,
  PatientAccessService,
} from '../patients/services/patient-access.service';

const ADULT_TOOTH_CODES = new Set([
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '31',
  '32',
  '33',
  '34',
  '35',
  '36',
  '37',
  '38',
  '41',
  '42',
  '43',
  '44',
  '45',
  '46',
  '47',
  '48',
]);

@Injectable()
export class OdontogramService {
  constructor(
    @InjectRepository(OdontogramEntry)
    private readonly odontogramRepository: Repository<OdontogramEntry>,

    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,

    @InjectRepository(ClinicalNote)
    private readonly clinicalNoteRepository: Repository<ClinicalNote>,

    @InjectRepository(Treatment)
    private readonly treatmentRepository: Repository<Treatment>,

    private readonly patientAccessService: PatientAccessService,
  ) {}

  async findByPatient(context: ClinicAccessContext, patientId: string) {
    await this.patientAccessService.assertPatientAccessible(context, patientId);

    return await this.odontogramRepository.find({
      where: { patientId },
      order: { toothCode: 'ASC' },
    });
  }

  async updateTooth(
    context: ClinicAccessContext,
    patientId: string,
    toothCode: string,
    professionalMembershipId: string,
    dto: UpdateOdontogramToothDto,
  ) {
    this.patientAccessService.assertCanManageClinical(context);
    this.assertAdultToothCode(toothCode);
    await this.patientAccessService.assertPatientAccessible(context, patientId);

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

    let entry = await this.odontogramRepository.findOne({
      where: { patientId, toothCode },
    });

    if (!entry) {
      entry = this.odontogramRepository.create({
        patientId,
        toothCode,
      });
    }

    Object.assign(entry, {
      status: dto.status,
      observation: dto.observation ?? null,
      clinicalNoteId: dto.clinicalNoteId ?? null,
      treatmentId: dto.treatmentId ?? null,
      professionalMembershipId,
    });

    return await this.odontogramRepository.save(entry);
  }

  private assertAdultToothCode(toothCode: string) {
    if (!ADULT_TOOTH_CODES.has(toothCode)) {
      throw new BadRequestException('Invalid adult tooth code');
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
