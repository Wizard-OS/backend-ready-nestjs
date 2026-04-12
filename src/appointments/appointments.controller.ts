import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiSecurity,
  ApiParam,
} from '@nestjs/swagger';

import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { CreateAppointmentTypeDto } from './dto/create-appointment-type.dto';
import { UpdateAppointmentTypeDto } from './dto/update-appointment-type.dto';
import { AuthClinic, GetClinicId } from '../auth/decorators';

@ApiTags('Appointments')
@ApiBearerAuth()
@ApiSecurity('x-clinic-id')
@Controller('appointments')
@AuthClinic()
export class AppointmentsController {
  constructor(private readonly appointmentService: AppointmentsService) {}

  @Post('types')
  @ApiOperation({ summary: 'Crear tipo de cita' })
  @ApiResponse({ status: 201, description: 'Tipo de cita creado' })
  createType(
    @GetClinicId() clinicId: string,
    @Body() createAppointmentTypeDto: CreateAppointmentTypeDto,
  ) {
    return this.appointmentService.createType(
      clinicId,
      createAppointmentTypeDto,
    );
  }

  @Get('types/all')
  @ApiOperation({ summary: 'Listar tipos de cita' })
  @ApiResponse({ status: 200, description: 'Lista de tipos de cita' })
  findTypes(@GetClinicId() clinicId: string) {
    return this.appointmentService.findTypes(clinicId);
  }

  @Patch('types/:id')
  @ApiOperation({ summary: 'Actualizar tipo de cita' })
  @ApiParam({ name: 'id', description: 'UUID del tipo de cita' })
  @ApiResponse({ status: 200, description: 'Tipo de cita actualizado' })
  updateType(
    @GetClinicId() clinicId: string,
    @Param('id') id: string,
    @Body() updateAppointmentTypeDto: UpdateAppointmentTypeDto,
  ) {
    return this.appointmentService.updateType(
      clinicId,
      id,
      updateAppointmentTypeDto,
    );
  }

  @Delete('types/:id')
  @ApiOperation({ summary: 'Eliminar tipo de cita' })
  @ApiParam({ name: 'id', description: 'UUID del tipo de cita' })
  @ApiResponse({ status: 200, description: 'Tipo de cita eliminado' })
  removeType(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.appointmentService.removeType(clinicId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear cita' })
  @ApiResponse({ status: 201, description: 'Cita creada' })
  @ApiResponse({
    status: 400,
    description: 'Solapamiento de horario o datos inválidos',
  })
  create(
    @GetClinicId() clinicId: string,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    return this.appointmentService.create(clinicId, createAppointmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar citas de la clínica' })
  @ApiResponse({ status: 200, description: 'Lista de citas' })
  findAll(@GetClinicId() clinicId: string) {
    return this.appointmentService.findAll(clinicId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener cita por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la cita' })
  @ApiResponse({ status: 200, description: 'Cita encontrada' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada' })
  findOne(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.appointmentService.findOne(clinicId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar cita' })
  @ApiParam({ name: 'id', description: 'UUID de la cita' })
  @ApiResponse({ status: 200, description: 'Cita actualizada' })
  update(
    @GetClinicId() clinicId: string,
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentService.update(clinicId, id, updateAppointmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar cita' })
  @ApiParam({ name: 'id', description: 'UUID de la cita' })
  @ApiResponse({ status: 200, description: 'Cita eliminada' })
  remove(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.appointmentService.remove(clinicId, id);
  }
}
