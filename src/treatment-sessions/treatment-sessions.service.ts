import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';

import { TreatmentSession } from './entities/treatment-session.entity';
import { Treatment } from '../treatments/entities/treatment.entity';
import { ClinicalRecord } from '../clinical-records/entities/clinical-record.entity';
import { CreateTreatmentSessionDto } from './dto/create-treatment-session.dto';
import { UpdateTreatmentSessionDto } from './dto/update-treatment-session.dto';

@Injectable()
export class TreatmentSessionsService {
  constructor(
    @InjectRepository(TreatmentSession)
    private readonly treatmentSessionRepository: Repository<TreatmentSession>,

    @InjectRepository(Treatment)
    private readonly treatmentRepository: Repository<Treatment>,

    @InjectRepository(ClinicalRecord)
    private readonly clinicalRecordRepository: Repository<ClinicalRecord>,
  ) {}

  async create(clinicId: string, dto: CreateTreatmentSessionDto) {
    const treatment = await this.findTreatmentInClinic(
      dto.treatmentId,
      clinicId,
    );
    const record = await this.findClinicalRecordInClinic(
      dto.clinicalRecordId,
      clinicId,
    );

    if (treatment.patientId !== record.patientId) {
      throw new BadRequestException(
        'Treatment and clinical record must belong to the same patient',
      );
    }

    const session = this.treatmentSessionRepository.create({
      ...dto,
      performedAt: new Date(dto.performedAt),
    });

    return await this.treatmentSessionRepository.save(session);
  }

  async findAll(clinicId: string) {
    return await this.treatmentSessionRepository
      .createQueryBuilder('session')
      .innerJoinAndSelect('session.treatment', 'treatment')
      .innerJoinAndSelect('session.clinicalRecord', 'record')
      .innerJoin('patients', 'patient', 'patient.id = record.patientId')
      .where('patient.clinicId = :clinicId', { clinicId })
      .orderBy('session.performedAt', 'DESC')
      .getMany();
  }

  async findOne(clinicId: string, id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid treatment session id');
    }

    const session = await this.treatmentSessionRepository
      .createQueryBuilder('session')
      .innerJoinAndSelect('session.treatment', 'treatment')
      .innerJoinAndSelect('session.clinicalRecord', 'record')
      .innerJoin('patients', 'patient', 'patient.id = record.patientId')
      .where('session.id = :id', { id })
      .andWhere('patient.clinicId = :clinicId', { clinicId })
      .getOne();

    if (!session) {
      throw new NotFoundException(`Treatment session with id ${id} not found`);
    }

    return session;
  }

  async update(clinicId: string, id: string, dto: UpdateTreatmentSessionDto) {
    const session = await this.findOne(clinicId, id);

    const treatmentId = dto.treatmentId ?? session.treatmentId;
    const clinicalRecordId = dto.clinicalRecordId ?? session.clinicalRecordId;

    const treatment = await this.findTreatmentInClinic(treatmentId, clinicId);
    const record = await this.findClinicalRecordInClinic(
      clinicalRecordId,
      clinicId,
    );

    if (treatment.patientId !== record.patientId) {
      throw new BadRequestException(
        'Treatment and clinical record must belong to the same patient',
      );
    }

    Object.assign(session, dto);
    if (dto.performedAt) {
      session.performedAt = new Date(dto.performedAt);
    }

    return await this.treatmentSessionRepository.save(session);
  }

  async remove(clinicId: string, id: string) {
    const session = await this.findOne(clinicId, id);
    await this.treatmentSessionRepository.remove(session);
    return { message: `Treatment session ${id} removed` };
  }

  private async findTreatmentInClinic(treatmentId: string, clinicId: string) {
    const treatment = await this.treatmentRepository
      .createQueryBuilder('treatment')
      .innerJoin('patients', 'patient', 'patient.id = treatment.patientId')
      .where('treatment.id = :treatmentId', { treatmentId })
      .andWhere('patient.clinicId = :clinicId', { clinicId })
      .getOne();

    if (!treatment) {
      throw new BadRequestException(
        `Treatment ${treatmentId} does not belong to the requested clinic`,
      );
    }

    return treatment;
  }

  private async findClinicalRecordInClinic(
    clinicalRecordId: string,
    clinicId: string,
  ) {
    const record = await this.clinicalRecordRepository
      .createQueryBuilder('record')
      .innerJoin('record.patient', 'patient')
      .where('record.id = :clinicalRecordId', { clinicalRecordId })
      .andWhere('patient.clinicId = :clinicId', { clinicId })
      .getOne();

    if (!record) {
      throw new BadRequestException(
        `Clinical record ${clinicalRecordId} does not belong to the requested clinic`,
      );
    }

    return record;
  }
}
