import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Patient } from '../patients/entities/patient.entity';
import { PatientsModule } from '../patients/patients.module';
import { Treatment } from '../treatments/entities/treatment.entity';
import { ClinicalNote } from '../clinical-notes/entities/clinical-note.entity';
import { OdontogramEntry } from './entities/odontogram-entry.entity';
import { OdontogramService } from './odontogram.service';
import { OdontogramController } from './odontogram.controller';

@Module({
  controllers: [OdontogramController],
  providers: [OdontogramService],
  imports: [
    PatientsModule,
    TypeOrmModule.forFeature([
      OdontogramEntry,
      Patient,
      ClinicalNote,
      Treatment,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class OdontogramModule {}
