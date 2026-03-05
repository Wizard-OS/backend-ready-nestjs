import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';

import { PatientsService } from './patients.service';

import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { AuthClinic, GetClinicId } from '../auth/decorators';

@Controller('patients')
@AuthClinic()
export class PatientsController {
  constructor(private readonly patientService: PatientsService) {}

  @Post('create')
  create(
    @GetClinicId() clinicId: string,
    @Body() createPatientDto: CreatePatientDto,
  ) {
    return this.patientService.create(clinicId, createPatientDto);
  }

  @Get()
  findAll(
    @GetClinicId() clinicId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.patientService.findAll(clinicId, paginationDto);
  }

  @Get(':term')
  findOne(@GetClinicId() clinicId: string, @Param('term') term: string) {
    return this.patientService.findOnePlain(clinicId, term);
  }

  @Patch(':id')
  update(
    @GetClinicId() clinicId: string,
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    return this.patientService.update(clinicId, id, updatePatientDto);
  }

  @Delete(':id')
  remove(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.patientService.remove(clinicId, id);
  }
}
