import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Treatment } from './entities/treatment.entity';
import { Patient } from '../patients/entities/patient.entity';
import { PatientsModule } from '../patients/patients.module';
import { Invoice } from '../invoices/entities/invoice.entity';
import { TreatmentsService } from './treatments.service';
import { TreatmentsController } from './treatments.controller';
import { ClinicMembership } from '../clinic-memberships/entities/clinic-membership.entity';

@Module({
  controllers: [TreatmentsController],
  providers: [TreatmentsService],
  imports: [
    PatientsModule,
    TypeOrmModule.forFeature([Treatment, Patient, ClinicMembership, Invoice]),
  ],
  exports: [TypeOrmModule],
})
export class TreatmentsModule {}
