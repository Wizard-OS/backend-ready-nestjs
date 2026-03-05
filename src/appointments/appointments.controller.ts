import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { CreateAppointmentTypeDto } from './dto/create-appointment-type.dto';
import { UpdateAppointmentTypeDto } from './dto/update-appointment-type.dto';
import { AuthClinic, GetClinicId } from '../auth/decorators';

@Controller('appointments')
@AuthClinic()
export class AppointmentsController {
  constructor(private readonly appointmentService: AppointmentsService) {}

  @Post('types')
  createType(
    @GetClinicId() clinicId: string,
    @Body() createAppointmentTypeDto: CreateAppointmentTypeDto,
  ) {
    return this.appointmentService.createType(clinicId, createAppointmentTypeDto);
  }

  @Get('types/all')
  findTypes(@GetClinicId() clinicId: string) {
    return this.appointmentService.findTypes(clinicId);
  }

  @Patch('types/:id')
  updateType(
    @GetClinicId() clinicId: string,
    @Param('id') id: string,
    @Body() updateAppointmentTypeDto: UpdateAppointmentTypeDto,
  ) {
    return this.appointmentService.updateType(clinicId, id, updateAppointmentTypeDto);
  }

  @Delete('types/:id')
  removeType(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.appointmentService.removeType(clinicId, id);
  }

  @Post()
  create(
    @GetClinicId() clinicId: string,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    return this.appointmentService.create(clinicId, createAppointmentDto);
  }

  @Get()
  findAll(@GetClinicId() clinicId: string) {
    return this.appointmentService.findAll(clinicId);
  }

  @Get(':id')
  findOne(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.appointmentService.findOne(clinicId, id);
  }

  @Patch(':id')
  update(
    @GetClinicId() clinicId: string,
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentService.update(clinicId, id, updateAppointmentDto);
  }

  @Delete(':id')
  remove(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.appointmentService.remove(clinicId, id);
  }
}
