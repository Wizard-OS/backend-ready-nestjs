import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';

import { ClinicMembership } from './entities/clinic-membership.entity';
import { CreateClinicMembershipDto } from './dto/create-clinic-membership.dto';
import { UpdateClinicMembershipDto } from './dto/update-clinic-membership.dto';

@Injectable()
export class ClinicMembershipsService {
  constructor(
    @InjectRepository(ClinicMembership)
    private readonly clinicMembershipRepository: Repository<ClinicMembership>,
  ) {}

  async create(createClinicMembershipDto: CreateClinicMembershipDto) {
    try {
      const membership = this.clinicMembershipRepository.create(
        createClinicMembershipDto,
      );
      return await this.clinicMembershipRepository.save(membership);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll(clinicId?: string) {
    if (clinicId && !isUUID(clinicId)) {
      throw new BadRequestException('Invalid clinic id');
    }

    return await this.clinicMembershipRepository.find({
      where: clinicId ? { clinicId } : {},
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid membership id');
    }

    const membership = await this.clinicMembershipRepository.findOne({
      where: { id },
    });

    if (!membership) {
      throw new NotFoundException(`Membership with id ${id} not found`);
    }

    return membership;
  }

  async update(id: string, updateClinicMembershipDto: UpdateClinicMembershipDto) {
    const membership = await this.findOne(id);
    Object.assign(membership, updateClinicMembershipDto);

    try {
      return await this.clinicMembershipRepository.save(membership);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async remove(id: string) {
    const membership = await this.findOne(id);
    membership.isActive = false;
    return await this.clinicMembershipRepository.save(membership);
  }

  private handleDBErrors(error: unknown): never {
    if (error instanceof Object && 'code' in error && error.code === '23505') {
      throw new BadRequestException((error as Record<string, unknown>).detail);
    }

    throw new InternalServerErrorException('Please check server logs');
  }
}
