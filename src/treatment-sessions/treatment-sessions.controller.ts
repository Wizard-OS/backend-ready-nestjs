import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import { TreatmentSessionsService } from './treatment-sessions.service';
import { CreateTreatmentSessionDto } from './dto/create-treatment-session.dto';
import { UpdateTreatmentSessionDto } from './dto/update-treatment-session.dto';
import { AuthClinic, GetClinicId } from '../auth/decorators';

@Controller('treatment-sessions')
@AuthClinic()
export class TreatmentSessionsController {
  constructor(private readonly treatmentSessionsService: TreatmentSessionsService) {}

  @Post()
  create(
    @GetClinicId() clinicId: string,
    @Body() createTreatmentSessionDto: CreateTreatmentSessionDto,
  ) {
    return this.treatmentSessionsService.create(clinicId, createTreatmentSessionDto);
  }

  @Get()
  findAll(@GetClinicId() clinicId: string) {
    return this.treatmentSessionsService.findAll(clinicId);
  }

  @Get(':id')
  findOne(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.treatmentSessionsService.findOne(clinicId, id);
  }

  @Patch(':id')
  update(
    @GetClinicId() clinicId: string,
    @Param('id') id: string,
    @Body() updateTreatmentSessionDto: UpdateTreatmentSessionDto,
  ) {
    return this.treatmentSessionsService.update(
      clinicId,
      id,
      updateTreatmentSessionDto,
    );
  }

  @Delete(':id')
  remove(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.treatmentSessionsService.remove(clinicId, id);
  }
}
