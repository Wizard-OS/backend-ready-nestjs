import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Treatment } from './entities/treatment.entity';
import { Patient } from '../patients/entities/patient.entity';
import { User } from '../auth/entities/user.entity';
import { TreatmentsService } from './treatments.service';
import { TreatmentsController } from './treatments.controller';

@Module({
  controllers: [TreatmentsController],
  providers: [TreatmentsService],
  imports: [TypeOrmModule.forFeature([Treatment, Patient, User])],
  exports: [TypeOrmModule],
})
export class TreatmentsModule {}
