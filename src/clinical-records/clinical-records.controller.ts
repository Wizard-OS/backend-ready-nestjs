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

import { ClinicalRecordsService } from './clinical-records.service';
import { CreateClinicalRecordDto } from './dto/create-clinical-record.dto';
import { UpdateClinicalRecordDto } from './dto/update-clinical-record.dto';
import { AuthClinic, GetClinicId } from '../auth/decorators';

@ApiTags('Clinical Records')
@ApiBearerAuth()
@ApiSecurity('x-clinic-id')
@Controller('clinical-records')
@AuthClinic()
export class ClinicalRecordsController {
  constructor(
    private readonly clinicalRecordsService: ClinicalRecordsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear registro clínico' })
  @ApiResponse({ status: 201, description: 'Registro clínico creado' })
  create(
    @GetClinicId() clinicId: string,
    @Body() createClinicalRecordDto: CreateClinicalRecordDto,
  ) {
    return this.clinicalRecordsService.create(
      clinicId,
      createClinicalRecordDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Listar registros clínicos' })
  @ApiResponse({ status: 200, description: 'Lista de registros clínicos' })
  findAll(@GetClinicId() clinicId: string) {
    return this.clinicalRecordsService.findAll(clinicId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener registro clínico por ID' })
  @ApiParam({ name: 'id', description: 'UUID del registro clínico' })
  @ApiResponse({ status: 200, description: 'Registro clínico encontrado' })
  findOne(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.clinicalRecordsService.findOne(clinicId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar registro clínico' })
  @ApiParam({ name: 'id', description: 'UUID del registro clínico' })
  @ApiResponse({ status: 200, description: 'Registro clínico actualizado' })
  update(
    @GetClinicId() clinicId: string,
    @Param('id') id: string,
    @Body() updateClinicalRecordDto: UpdateClinicalRecordDto,
  ) {
    return this.clinicalRecordsService.update(
      clinicId,
      id,
      updateClinicalRecordDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar registro clínico' })
  @ApiParam({ name: 'id', description: 'UUID del registro clínico' })
  @ApiResponse({ status: 200, description: 'Registro clínico eliminado' })
  remove(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.clinicalRecordsService.remove(clinicId, id);
  }
}
