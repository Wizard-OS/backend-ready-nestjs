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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiSecurity,
  ApiParam,
} from '@nestjs/swagger';

import { PatientsService } from './patients.service';

import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { AuthClinic, GetClinicId } from '../auth/decorators';

@ApiTags('Patients')
@ApiBearerAuth()
@ApiSecurity('x-clinic-id')
@Controller('patients')
@AuthClinic()
export class PatientsController {
  constructor(private readonly patientService: PatientsService) {}

  @Post('create')
  @ApiOperation({ summary: 'Crear paciente' })
  @ApiResponse({ status: 201, description: 'Paciente creado' })
  create(
    @GetClinicId() clinicId: string,
    @Body() createPatientDto: CreatePatientDto,
  ) {
    return this.patientService.create(clinicId, createPatientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pacientes (paginado)' })
  @ApiResponse({ status: 200, description: 'Lista de pacientes' })
  findAll(
    @GetClinicId() clinicId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.patientService.findAll(clinicId, paginationDto);
  }

  @Get(':term')
  @ApiOperation({ summary: 'Buscar paciente por ID o término' })
  @ApiParam({ name: 'term', description: 'UUID o término de búsqueda' })
  @ApiResponse({ status: 200, description: 'Paciente encontrado' })
  @ApiResponse({ status: 404, description: 'Paciente no encontrado' })
  findOne(@GetClinicId() clinicId: string, @Param('term') term: string) {
    return this.patientService.findOnePlain(clinicId, term);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar paciente' })
  @ApiParam({ name: 'id', description: 'UUID del paciente' })
  @ApiResponse({ status: 200, description: 'Paciente actualizado' })
  update(
    @GetClinicId() clinicId: string,
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    return this.patientService.update(clinicId, id, updatePatientDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar paciente' })
  @ApiParam({ name: 'id', description: 'UUID del paciente' })
  @ApiResponse({ status: 200, description: 'Paciente eliminado' })
  remove(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.patientService.remove(clinicId, id);
  }
}
