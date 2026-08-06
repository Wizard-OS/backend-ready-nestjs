import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Patient } from '../patients/entities/patient.entity';
import { PatientsModule } from '../patients/patients.module';
import { Treatment } from '../treatments/entities/treatment.entity';
import { PatientFilesModule } from '../patient-files/patient-files.module';
import { ClinicalNote } from '../clinical-notes/entities/clinical-note.entity';
import { OdontogramEntry } from './entities/odontogram-entry.entity';
import { OdontogramService } from './odontogram.service';
import { OdontogramController } from './odontogram.controller';
import { OdontogramPdfService } from './odontogram-pdf.service';

@Module({
  controllers: [OdontogramController],
  providers: [OdontogramService, OdontogramPdfService],
  imports: [
    PatientsModule,
    PatientFilesModule,
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
