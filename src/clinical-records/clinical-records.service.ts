import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';

import { ClinicalRecord } from './entities/clinical-record.entity';
import { Patient } from '../patients/entities/patient.entity';
import { CreateClinicalRecordDto } from './dto/create-clinical-record.dto';
import { UpdateClinicalRecordDto } from './dto/update-clinical-record.dto';

@Injectable()
export class ClinicalRecordsService {
  constructor(
    @InjectRepository(ClinicalRecord)
    private readonly clinicalRecordRepository: Repository<ClinicalRecord>,

    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async create(clinicId: string, dto: CreateClinicalRecordDto) {
    await this.assertPatientInClinic(dto.patientId, clinicId);

    const existing = await this.clinicalRecordRepository.findOne({
      where: { patientId: dto.patientId },
    });

    if (existing) {
      throw new BadRequestException(
        `Clinical record already exists for patient ${dto.patientId}`,
      );
    }

    const record = this.clinicalRecordRepository.create(dto);
    return await this.clinicalRecordRepository.save(record);
  }

  async findAll(clinicId: string) {
    return await this.clinicalRecordRepository
      .createQueryBuilder('record')
      .innerJoinAndSelect('record.patient', 'patient')
      .leftJoinAndSelect('record.notes', 'notes')
      .where('patient.clinicId = :clinicId', { clinicId })
      .orderBy('record.createdAt', 'DESC')
      .getMany();
  }

  async findOne(clinicId: string, id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid clinical record id');
    }

    const record = await this.clinicalRecordRepository
      .createQueryBuilder('record')
      .innerJoinAndSelect('record.patient', 'patient')
      .leftJoinAndSelect('record.notes', 'notes')
      .where('record.id = :id', { id })
      .andWhere('patient.clinicId = :clinicId', { clinicId })
      .getOne();

    if (!record) {
      throw new NotFoundException(`Clinical record with id ${id} not found`);
    }

    return record;
  }

  async update(clinicId: string, id: string, dto: UpdateClinicalRecordDto) {
    const record = await this.findOne(clinicId, id);

    if (dto.patientId && dto.patientId !== record.patientId) {
      await this.assertPatientInClinic(dto.patientId, clinicId);

      const existing = await this.clinicalRecordRepository.findOne({
        where: { patientId: dto.patientId },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException(
          `Clinical record already exists for patient ${dto.patientId}`,
        );
      }
    }

    Object.assign(record, dto);
    return await this.clinicalRecordRepository.save(record);
  }

  async remove(clinicId: string, id: string) {
    const record = await this.findOne(clinicId, id);
    await this.clinicalRecordRepository.remove(record);
    return { message: `Clinical record ${id} removed` };
  }

  private async assertPatientInClinic(patientId: string, clinicId: string) {
    const patient = await this.patientRepository.findOne({
      where: { id: patientId, clinicId },
      select: { id: true },
    });

    if (!patient) {
      throw new BadRequestException('Patient does not belong to the requested clinic');
    }
  }
}
