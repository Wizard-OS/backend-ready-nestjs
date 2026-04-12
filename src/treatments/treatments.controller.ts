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

import { TreatmentsService } from './treatments.service';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';
import { AuthClinic, GetClinicId } from '../auth/decorators';

@ApiTags('Treatments')
@ApiBearerAuth()
@ApiSecurity('x-clinic-id')
@Controller('treatments')
@AuthClinic()
export class TreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear tratamiento' })
  @ApiResponse({ status: 201, description: 'Tratamiento creado' })
  create(
    @GetClinicId() clinicId: string,
    @Body() createTreatmentDto: CreateTreatmentDto,
  ) {
    return this.treatmentsService.create(clinicId, createTreatmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar tratamientos' })
  @ApiResponse({ status: 200, description: 'Lista de tratamientos' })
  findAll(@GetClinicId() clinicId: string) {
    return this.treatmentsService.findAll(clinicId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener tratamiento por ID' })
  @ApiParam({ name: 'id', description: 'UUID del tratamiento' })
  @ApiResponse({ status: 200, description: 'Tratamiento encontrado' })
  findOne(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.treatmentsService.findOne(clinicId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar tratamiento' })
  @ApiParam({ name: 'id', description: 'UUID del tratamiento' })
  @ApiResponse({ status: 200, description: 'Tratamiento actualizado' })
  update(
    @GetClinicId() clinicId: string,
    @Param('id') id: string,
    @Body() updateTreatmentDto: UpdateTreatmentDto,
  ) {
    return this.treatmentsService.update(clinicId, id, updateTreatmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar tratamiento' })
  @ApiParam({ name: 'id', description: 'UUID del tratamiento' })
  @ApiResponse({ status: 200, description: 'Tratamiento eliminado' })
  remove(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.treatmentsService.remove(clinicId, id);
  }
}
