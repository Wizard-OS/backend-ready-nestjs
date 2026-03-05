import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import { ClinicalRecordsService } from './clinical-records.service';
import { CreateClinicalRecordDto } from './dto/create-clinical-record.dto';
import { UpdateClinicalRecordDto } from './dto/update-clinical-record.dto';
import { AuthClinic, GetClinicId } from '../auth/decorators';

@Controller('clinical-records')
@AuthClinic()
export class ClinicalRecordsController {
  constructor(private readonly clinicalRecordsService: ClinicalRecordsService) {}

  @Post()
  create(
    @GetClinicId() clinicId: string,
    @Body() createClinicalRecordDto: CreateClinicalRecordDto,
  ) {
    return this.clinicalRecordsService.create(clinicId, createClinicalRecordDto);
  }

  @Get()
  findAll(@GetClinicId() clinicId: string) {
    return this.clinicalRecordsService.findAll(clinicId);
  }

  @Get(':id')
  findOne(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.clinicalRecordsService.findOne(clinicId, id);
  }

  @Patch(':id')
  update(
    @GetClinicId() clinicId: string,
    @Param('id') id: string,
    @Body() updateClinicalRecordDto: UpdateClinicalRecordDto,
  ) {
    return this.clinicalRecordsService.update(clinicId, id, updateClinicalRecordDto);
  }

  @Delete(':id')
  remove(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.clinicalRecordsService.remove(clinicId, id);
  }
}
