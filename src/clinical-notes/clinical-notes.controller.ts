import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { ClinicalNotesService } from './clinical-notes.service';
import { CreateClinicalNoteDto } from './dto/create-clinical-note.dto';
import { UpdateClinicalNoteDto } from './dto/update-clinical-note.dto';
import {
  AuthClinic,
  GetClinicId,
  GetClinicMembershipId,
  GetUser,
} from '../auth/decorators';

@Controller('clinical-notes')
@AuthClinic()
export class ClinicalNotesController {
  constructor(private readonly clinicalNotesService: ClinicalNotesService) {}

  @Post()
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
  findAll(@GetClinicId() clinicId: string) {
    return this.clinicalNotesService.findAll(clinicId);
  }

  @Get(':id')
  findOne(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.clinicalNotesService.findOne(clinicId, id);
  }

  @Patch(':id')
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
  remove(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.clinicalNotesService.remove(clinicId, id);
  }
}
