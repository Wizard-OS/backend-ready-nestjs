import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClinicalRecord } from './entities/clinical-record.entity';
import { Patient } from '../patients/entities/patient.entity';
import { ClinicalRecordsService } from './clinical-records.service';
import { ClinicalRecordsController } from './clinical-records.controller';

@Module({
  controllers: [ClinicalRecordsController],
  providers: [ClinicalRecordsService],
  imports: [TypeOrmModule.forFeature([ClinicalRecord, Patient])],
  exports: [TypeOrmModule],
})
export class ClinicalRecordsModule {}
