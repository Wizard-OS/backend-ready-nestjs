import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';

import { Clinic } from './entities/clinic.entity';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';

@Injectable()
export class ClinicsService {
  constructor(
    @InjectRepository(Clinic)
    private readonly clinicRepository: Repository<Clinic>,
  ) {}

  async create(createClinicDto: CreateClinicDto) {
    try {
      const clinic = this.clinicRepository.create(createClinicDto);
      return await this.clinicRepository.save(clinic);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll() {
    return await this.clinicRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid clinic id');
    }

    const clinic = await this.clinicRepository.findOne({ where: { id } });
    if (!clinic) throw new NotFoundException(`Clinic with id ${id} not found`);

    return clinic;
  }

  async update(id: string, updateClinicDto: UpdateClinicDto) {
    const clinic = await this.findOne(id);
    Object.assign(clinic, updateClinicDto);

    try {
      return await this.clinicRepository.save(clinic);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async remove(id: string) {
    const clinic = await this.findOne(id);
    clinic.isActive = false;
    return await this.clinicRepository.save(clinic);
  }

  private handleDBErrors(error: unknown): never {
    if (error instanceof Object && 'code' in error && error.code === '23505') {
      throw new BadRequestException((error as Record<string, unknown>).detail);
    }

    throw new InternalServerErrorException('Please check server logs');
  }
}
