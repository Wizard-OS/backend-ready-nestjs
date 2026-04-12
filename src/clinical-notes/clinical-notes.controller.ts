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

import { ClinicalNotesService } from './clinical-notes.service';
import { CreateClinicalNoteDto } from './dto/create-clinical-note.dto';
import { UpdateClinicalNoteDto } from './dto/update-clinical-note.dto';
import {
  AuthClinic,
  GetClinicId,
  GetClinicMembershipId,
  GetUser,
} from '../auth/decorators';

@ApiTags('Clinical Notes')
@ApiBearerAuth()
@ApiSecurity('x-clinic-id')
@Controller('clinical-notes')
@AuthClinic()
export class ClinicalNotesController {
  constructor(private readonly clinicalNotesService: ClinicalNotesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nota clínica' })
  @ApiResponse({ status: 201, description: 'Nota clínica creada' })
  create(
    @GetClinicId() clinicId: string,
    @GetUser('id') authorId: string,
    @GetClinicMembershipId() authorMembershipId: string,
    @Body() createClinicalNoteDto: CreateClinicalNoteDto,
  ) {
    return this.clinicalNotesService.create(
      clinicId,
      authorId,
      authorMembershipId,
      createClinicalNoteDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Listar notas clínicas' })
  @ApiResponse({ status: 200, description: 'Lista de notas clínicas' })
  findAll(@GetClinicId() clinicId: string) {
    return this.clinicalNotesService.findAll(clinicId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener nota clínica por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la nota clínica' })
  @ApiResponse({ status: 200, description: 'Nota clínica encontrada' })
  findOne(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.clinicalNotesService.findOne(clinicId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar nota clínica' })
  @ApiParam({ name: 'id', description: 'UUID de la nota clínica' })
  @ApiResponse({ status: 200, description: 'Nota clínica actualizada' })
  update(
    @GetClinicId() clinicId: string,
    @Param('id') id: string,
    @Body() updateClinicalNoteDto: UpdateClinicalNoteDto,
  ) {
    return this.clinicalNotesService.update(
      clinicId,
      id,
      updateClinicalNoteDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar nota clínica' })
  @ApiParam({ name: 'id', description: 'UUID de la nota clínica' })
  @ApiResponse({ status: 200, description: 'Nota clínica eliminada' })
  remove(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.clinicalNotesService.remove(clinicId, id);
  }
}
