import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Patient } from '../patients/entities/patient.entity';
import { ClinicMembership } from '../clinic-memberships/entities/clinic-membership.entity';
import { ClinicMembershipRole } from '../clinic-memberships/interfaces/clinic-membership-role.enum';
import { PatientProfessionalAssignment } from './entities/patient-professional-assignment.entity';
import { CreatePatientAssignmentDto } from './dto/create-patient-assignment.dto';

@Injectable()
export class PatientAssignmentsService {
  constructor(
    @InjectRepository(PatientProfessionalAssignment)
    private readonly assignmentRepository: Repository<PatientProfessionalAssignment>,

    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,

    @InjectRepository(ClinicMembership)
    private readonly membershipRepository: Repository<ClinicMembership>,
  ) {}

  async findAll(clinicId: string, patientId?: string) {
    const query = this.assignmentRepository
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.professionalMembership', 'membership')
      .leftJoinAndSelect('membership.user', 'user')
      .where('assignment.clinicId = :clinicId', { clinicId })
      .andWhere('assignment.isActive = true');

    if (patientId) {
      query.andWhere('assignment.patientId = :patientId', { patientId });
    }

    return await query.orderBy('assignment.createdAt', 'DESC').getMany();
  }

  async create(
    clinicId: string,
    assignedByMembershipId: string,
    dto: CreatePatientAssignmentDto,
  ) {
    await this.assertPatientInClinic(dto.patientId, clinicId);
    await this.assertMembershipInClinic(assignedByMembershipId, clinicId);
    await this.assertSecondaryProfessional(
      dto.professionalMembershipId,
      clinicId,
    );

    const existing = await this.assignmentRepository.findOne({
      where: {
        clinicId,
        patientId: dto.patientId,
        professionalMembershipId: dto.professionalMembershipId,
        isActive: true,
      },
    });

    if (existing) return existing;

    const assignment = this.assignmentRepository.create({
      clinicId,
      patientId: dto.patientId,
      professionalMembershipId: dto.professionalMembershipId,
      assignedByMembershipId,
      isActive: true,
    });

    return await this.assignmentRepository.save(assignment);
  }

  async revoke(clinicId: string, id: string, revokedByMembershipId: string) {
    const assignment = await this.assignmentRepository.findOne({
      where: { id, clinicId, isActive: true },
    });

    if (!assignment) {
      throw new NotFoundException(`Patient assignment ${id} not found`);
    }

    await this.assertMembershipInClinic(revokedByMembershipId, clinicId);

    assignment.isActive = false;
    assignment.revokedAt = new Date();
    assignment.revokedByMembershipId = revokedByMembershipId;

    return await this.assignmentRepository.save(assignment);
  }

  private async assertPatientInClinic(patientId: string, clinicId: string) {
    const patient = await this.patientRepository.findOne({
      where: { id: patientId, clinicId },
      select: { id: true },
    });

    if (!patient) {
      throw new BadRequestException(
        'Patient does not belong to the requested clinic',
      );
    }
  }

  private async assertMembershipInClinic(
    membershipId: string,
    clinicId: string,
  ) {
    const membership = await this.membershipRepository.findOne({
      where: {
        id: membershipId,
        clinicId,
        isActive: true,
        user: { isActive: true },
      },
      relations: { user: true },
      select: { id: true },
    });

    if (!membership) {
      throw new BadRequestException(
        'Membership does not belong to the requested clinic',
      );
    }
  }

  private async assertSecondaryProfessional(
    membershipId: string,
    clinicId: string,
  ) {
    const membership = await this.membershipRepository.findOne({
      where: {
        id: membershipId,
        clinicId,
        isActive: true,
        user: { isActive: true },
      },
      relations: { user: true },
      select: { id: true, role: true },
    });

    if (!membership) {
      throw new BadRequestException(
        'Professional membership does not belong to the requested clinic',
      );
    }

    if (
      ![
        ClinicMembershipRole.odontologist,
        ClinicMembershipRole.assistant,
      ].includes(membership.role)
    ) {
      throw new BadRequestException(
        'Patient assignments are only for secondary professional profiles',
      );
    }
  }
}
