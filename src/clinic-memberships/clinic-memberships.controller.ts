import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { ClinicMembershipsService } from './clinic-memberships.service';
import { CreateClinicMembershipDto } from './dto/create-clinic-membership.dto';
import { UpdateClinicMembershipDto } from './dto/update-clinic-membership.dto';

@ApiTags('Clinic Memberships')
@ApiBearerAuth()
@Controller('clinic-memberships')
@Auth(ValidRoles.admin)
export class ClinicMembershipsController {
  constructor(
    private readonly clinicMembershipsService: ClinicMembershipsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear membresía de clínica' })
  @ApiResponse({ status: 201, description: 'Membresía creada' })
  create(@Body() createClinicMembershipDto: CreateClinicMembershipDto) {
    return this.clinicMembershipsService.create(createClinicMembershipDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar membresías (filtrar opcionalmente por clínica)',
  })
  @ApiQuery({
    name: 'clinicId',
    required: false,
    description: 'UUID de la clínica para filtrar',
  })
  @ApiResponse({ status: 200, description: 'Lista de membresías' })
  findAll(@Query('clinicId') clinicId?: string) {
    return this.clinicMembershipsService.findAll(clinicId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener membresía por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la membresía' })
  @ApiResponse({ status: 200, description: 'Membresía encontrada' })
  @ApiResponse({ status: 404, description: 'Membresía no encontrada' })
  findOne(@Param('id') id: string) {
    return this.clinicMembershipsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar membresía' })
  @ApiParam({ name: 'id', description: 'UUID de la membresía' })
  @ApiResponse({ status: 200, description: 'Membresía actualizada' })
  update(
    @Param('id') id: string,
    @Body() updateClinicMembershipDto: UpdateClinicMembershipDto,
  ) {
    return this.clinicMembershipsService.update(id, updateClinicMembershipDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar membresía' })
  @ApiParam({ name: 'id', description: 'UUID de la membresía' })
  @ApiResponse({ status: 200, description: 'Membresía eliminada' })
  remove(@Param('id') id: string) {
    return this.clinicMembershipsService.remove(id);
  }
}
