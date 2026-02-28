import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async create(createPatientDto: CreatePatientDto) {
    try {
      return await this.patientRepository.save(createPatientDto);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll() {
    return await this.patientRepository.find();
  }

  async findOne(id: string) {
    return await this.patientRepository.findOne({
      where: { id },
    });
  }

  async update(id: string, updatePatientDto: UpdatePatientDto) {
    try {
      await this.patientRepository.update(id, updatePatientDto);
      return await this.patientRepository.findOne({
        where: { id },
      });
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async remove(id: string) {
    const patient = await this.patientRepository.findOne({ where: { id } });
    if (!patient) {
      throw new NotFoundException(`Patient with id ${id} not found`);
    }
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
