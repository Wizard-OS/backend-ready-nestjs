import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClinicalNote } from './entities/clinical-note.entity';
import { ClinicalNotesService } from './clinical-notes.service';
import { ClinicalNotesController } from './clinical-notes.controller';

@Module({
  controllers: [ClinicalNotesController],
  providers: [ClinicalNotesService],
  imports: [TypeOrmModule.forFeature([ClinicalNote])],
  exports: [TypeOrmModule],
})
export class ClinicalNotesModule {}
