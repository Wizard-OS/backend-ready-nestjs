import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { isUUID } from 'class-validator';

import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import {
  ClinicAccessContext,
  PatientAccessService,
} from './services/patient-access.service';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,

    private readonly patientAccessService: PatientAccessService,
  ) {}

  async create(
    context: ClinicAccessContext,
    createPatientDto: CreatePatientDto,
  ) {
    this.patientAccessService.assertCanManagePatients(context);

    if (
      createPatientDto.clinicId &&
      context.clinicId !== createPatientDto.clinicId
    ) {
      throw new BadRequestException(
        'clinicId does not match x-clinic-id scope',
      );
    }

    try {
      const patient = this.patientRepository.create({
        ...createPatientDto,
        clinicId: context.clinicId,
      });
      return await this.patientRepository.save(patient);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll(context: ClinicAccessContext, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const patients = await this.patientAccessService
      .applyPatientAccessFilter(
        this.patientRepository.createQueryBuilder('patient'),
        'patient',
        context,
      )
      .skip(offset)
      .take(limit)
      .getMany();

    return this.patientAccessService.sanitizePatients(patients, context);
  }

  async findOne(context: ClinicAccessContext, term: string) {
    let patient: Patient | null;

    if (isUUID(term)) {
      patient = await this.patientRepository.findOne({
        where: { id: term, clinicId: context.clinicId },
      });
    } else {
      const queryBuilder = this.patientRepository.createQueryBuilder('patient');

      this.patientAccessService.applyPatientAccessFilter(
        queryBuilder,
        'patient',
        context,
      );

      const canSearchContact =
        this.patientAccessService.canViewPatientContact(context);

      patient = await queryBuilder
        .andWhere(
          new Brackets((qb) => {
            qb.where('patient.documentId = :exactTerm', { exactTerm: term })
              .orWhere('patient.firstName ILIKE :searchTerm', {
                searchTerm: `%${term}%`,
              })
              .orWhere('patient.lastName ILIKE :searchTerm', {
                searchTerm: `%${term}%`,
              });

            if (canSearchContact) {
              qb.orWhere('patient.email = :exactTerm', {
                exactTerm: term,
              }).orWhere('patient.phone = :exactTerm', { exactTerm: term });
            }
          }),
        )
        .getOne();
    }

    if (!patient)
      throw new NotFoundException(
        `Patient with id, email, document, phone, firstName or lastName "${term}" not found`,
      );

    await this.patientAccessService.assertPatientAccessible(
      context,
      patient.id,
    );

    return this.patientAccessService.sanitizePatient(patient, context);
  }

  async findOnePlain(context: ClinicAccessContext, term: string) {
    return await this.findOne(context, term);
  }

  async update(
    context: ClinicAccessContext,
    id: string,
    updatePatientDto: UpdatePatientDto,
  ) {
    this.patientAccessService.assertCanManagePatients(context);
    const patient = await this.findOne(context, id);

    if (
      updatePatientDto.clinicId &&
      updatePatientDto.clinicId !== context.clinicId
    ) {
      throw new BadRequestException(
        'clinicId does not match x-clinic-id scope',
      );
    }

    try {
      Object.assign(patient, updatePatientDto);
      return await this.patientRepository.save(patient);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async remove(context: ClinicAccessContext, id: string) {
    this.patientAccessService.assertCanManagePatients(context);
    const patient = await this.findOne(context, id);
    return await this.patientRepository.remove(patient);
  }

  private handleDBErrors(error: unknown): never {
    if (error instanceof Object && 'code' in error && error.code === '23505') {
      throw new BadRequestException((error as Record<string, unknown>).detail);
    }

    console.log(error);

    throw new InternalServerErrorException('Please check server logs');
  }
}
