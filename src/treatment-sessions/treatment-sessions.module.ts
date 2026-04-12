import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TreatmentSession } from './entities/treatment-session.entity';
import { Treatment } from '../treatments/entities/treatment.entity';
import { ClinicalRecord } from '../clinical-records/entities/clinical-record.entity';
import { TreatmentSessionsService } from './treatment-sessions.service';
import { TreatmentSessionsController } from './treatment-sessions.controller';

@Module({
  controllers: [TreatmentSessionsController],
  providers: [TreatmentSessionsService],
  imports: [
    TypeOrmModule.forFeature([TreatmentSession, Treatment, ClinicalRecord]),
  ],
  exports: [TypeOrmModule],
})
export class TreatmentSessionsModule {}
