import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import { TreatmentsService } from './treatments.service';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';
import { AuthClinic, GetClinicId } from '../auth/decorators';

@Controller('treatments')
@AuthClinic()
export class TreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) {}

  @Post()
  create(
    @GetClinicId() clinicId: string,
    @Body() createTreatmentDto: CreateTreatmentDto,
  ) {
    return this.treatmentsService.create(clinicId, createTreatmentDto);
  }

  @Get()
  findAll(@GetClinicId() clinicId: string) {
    return this.treatmentsService.findAll(clinicId);
  }

  @Get(':id')
  findOne(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.treatmentsService.findOne(clinicId, id);
  }

  @Patch(':id')
  update(
    @GetClinicId() clinicId: string,
    @Param('id') id: string,
    @Body() updateTreatmentDto: UpdateTreatmentDto,
  ) {
    return this.treatmentsService.update(clinicId, id, updateTreatmentDto);
  }

  @Delete(':id')
  remove(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.treatmentsService.remove(clinicId, id);
  }
}
