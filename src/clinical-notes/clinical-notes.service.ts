import { Injectable } from '@nestjs/common';
import { CreateClinicalNoteDto } from './dto/create-clinical-note.dto';
import { UpdateClinicalNoteDto } from './dto/update-clinical-note.dto';

@Injectable()
export class ClinicalNotesService {
  create(createClinicalNoteDto: CreateClinicalNoteDto) {
    return 'This action adds a new clinicalNote';
  }

  findAll() {
    return `This action returns all clinicalNotes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} clinicalNote`;
  }

  update(id: number, updateClinicalNoteDto: UpdateClinicalNoteDto) {
    return `This action updates a #${id} clinicalNote`;
  }

  remove(id: number) {
    return `This action removes a #${id} clinicalNote`;
  }
}
