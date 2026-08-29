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
import { QueryPatientsDto } from './dto/query-patients.dto';
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
    this.assertProfilePhotoManagedSeparately(createPatientDto);

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

  async findAll(context: ClinicAccessContext, paginationDto: QueryPatientsDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const includeArchived =
      'includeArchived' in paginationDto &&
      paginationDto.includeArchived === 'true';

    if (includeArchived) {
      this.patientAccessService.assertCanManagePatients(context);
    }

    const query = this.patientRepository.createQueryBuilder('patient');

    if (includeArchived) {
      query.withDeleted();
    }

    const patients = await this.patientAccessService
      .applyPatientAccessFilter(query, 'patient', context)
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
    this.assertProfilePhotoManagedSeparately(updatePatientDto);
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
    await this.patientRepository.softRemove(patient);
    return { message: `Patient ${id} archived` };
  }

  async reactivate(context: ClinicAccessContext, id: string) {
    this.patientAccessService.assertCanManagePatients(context);

    const patient = await this.patientRepository.findOne({
      where: { id, clinicId: context.clinicId },
      withDeleted: true,
    });

    if (!patient) {
      throw new NotFoundException(`Patient with id "${id}" not found`);
    }

    if (!patient.deletedAt) {
      return this.patientAccessService.sanitizePatient(patient, context);
    }

    patient.deletedAt = null;
    const saved = await this.patientRepository.save(patient);
    return this.patientAccessService.sanitizePatient(saved, context);
  }

  private handleDBErrors(error: unknown): never {
    if (error instanceof Object && 'code' in error && error.code === '23505') {
      throw new BadRequestException((error as Record<string, unknown>).detail);
    }

    console.log(error);

    throw new InternalServerErrorException('Please check server logs');
  }

  private assertProfilePhotoManagedSeparately(
    dto: Pick<CreatePatientDto, 'profilePhotoFileId' | 'profilePhotoUrl'>,
  ) {
    if (dto.profilePhotoFileId || dto.profilePhotoUrl) {
      throw new BadRequestException(
        'Profile photo must be uploaded through /patients/:patientId/profile-photo',
      );
    }
  }
}
