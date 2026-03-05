import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';

import { ClinicalNote } from './entities/clinical-note.entity';
import { ClinicalRecord } from '../clinical-records/entities/clinical-record.entity';
import { CreateClinicalNoteDto } from './dto/create-clinical-note.dto';
import { UpdateClinicalNoteDto } from './dto/update-clinical-note.dto';

@Injectable()
export class ClinicalNotesService {
  constructor(
    @InjectRepository(ClinicalNote)
    private readonly clinicalNoteRepository: Repository<ClinicalNote>,

    @InjectRepository(ClinicalRecord)
    private readonly clinicalRecordRepository: Repository<ClinicalRecord>,
  ) {}

  async create(
    clinicId: string,
    authorId: string,
    authorMembershipId: string,
    dto: CreateClinicalNoteDto,
  ) {
    await this.assertRecordInClinic(dto.clinicalRecordId, clinicId);

    const note = this.clinicalNoteRepository.create({
      ...dto,
      authorId,
      authorMembershipId,
    });

    return await this.clinicalNoteRepository.save(note);
  }

  async findAll(clinicId: string) {
    return await this.clinicalNoteRepository
      .createQueryBuilder('note')
      .innerJoinAndSelect('note.clinicalRecord', 'record')
      .innerJoinAndSelect('record.patient', 'patient')
      .leftJoinAndSelect('note.author', 'author')
      .where('patient.clinicId = :clinicId', { clinicId })
      .orderBy('note.createdAt', 'DESC')
      .getMany();
  }

  async findOne(clinicId: string, id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid clinical note id');
    }

    const note = await this.clinicalNoteRepository
      .createQueryBuilder('note')
      .innerJoinAndSelect('note.clinicalRecord', 'record')
      .innerJoinAndSelect('record.patient', 'patient')
      .leftJoinAndSelect('note.author', 'author')
      .where('note.id = :id', { id })
      .andWhere('patient.clinicId = :clinicId', { clinicId })
      .getOne();

    if (!note) {
      throw new NotFoundException(`Clinical note with id ${id} not found`);
    }

    return note;
  }

  async update(clinicId: string, id: string, dto: UpdateClinicalNoteDto) {
    const note = await this.findOne(clinicId, id);

    if (dto.clinicalRecordId && dto.clinicalRecordId !== note.clinicalRecordId) {
      await this.assertRecordInClinic(dto.clinicalRecordId, clinicId);
    }

    Object.assign(note, dto);
    return await this.clinicalNoteRepository.save(note);
  }

  async remove(clinicId: string, id: string) {
    const note = await this.findOne(clinicId, id);
    await this.clinicalNoteRepository.remove(note);
    return { message: `Clinical note ${id} removed` };
  }

  private async assertRecordInClinic(clinicalRecordId: string, clinicId: string) {
    const record = await this.clinicalRecordRepository
      .createQueryBuilder('record')
      .innerJoin('record.patient', 'patient')
      .where('record.id = :clinicalRecordId', { clinicalRecordId })
      .andWhere('patient.clinicId = :clinicId', { clinicId })
      .getOne();

    if (!record) {
      throw new BadRequestException(
        'Clinical record does not belong to the requested clinic',
      );
    }
  }
}
