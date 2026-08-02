import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClinicalNote } from './entities/clinical-note.entity';
import { ClinicalRecord } from '../clinical-records/entities/clinical-record.entity';
import { PatientsModule } from '../patients/patients.module';
import { ClinicalNotesService } from './clinical-notes.service';
import { ClinicalNotesController } from './clinical-notes.controller';

@Module({
  controllers: [ClinicalNotesController],
  providers: [ClinicalNotesService],
  imports: [
    PatientsModule,
    TypeOrmModule.forFeature([ClinicalNote, ClinicalRecord]),
  ],
  exports: [TypeOrmModule],
})
export class ClinicalNotesModule {}
