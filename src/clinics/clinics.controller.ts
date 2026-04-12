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
  ApiParam,
} from '@nestjs/swagger';

import { ClinicsService } from './clinics.service';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';

@ApiTags('Clinics')
@ApiBearerAuth()
@Controller('clinics')
@Auth(ValidRoles.admin)
export class ClinicsController {
  constructor(private readonly clinicsService: ClinicsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear clínica' })
  @ApiResponse({ status: 201, description: 'Clínica creada' })
  create(@Body() createClinicDto: CreateClinicDto) {
    return this.clinicsService.create(createClinicDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las clínicas' })
  @ApiResponse({ status: 200, description: 'Lista de clínicas' })
  findAll() {
    return this.clinicsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener clínica por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la clínica' })
  @ApiResponse({ status: 200, description: 'Clínica encontrada' })
  @ApiResponse({ status: 404, description: 'Clínica no encontrada' })
  findOne(@Param('id') id: string) {
    return this.clinicsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar clínica' })
  @ApiParam({ name: 'id', description: 'UUID de la clínica' })
  @ApiResponse({ status: 200, description: 'Clínica actualizada' })
  update(@Param('id') id: string, @Body() updateClinicDto: UpdateClinicDto) {
    return this.clinicsService.update(id, updateClinicDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar clínica' })
  @ApiParam({ name: 'id', description: 'UUID de la clínica' })
  @ApiResponse({ status: 200, description: 'Clínica eliminada' })
  remove(@Param('id') id: string) {
    return this.clinicsService.remove(id);
  }
}
