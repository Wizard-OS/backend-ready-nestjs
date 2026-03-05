import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { User } from '../auth/entities/user.entity';
import { Clinic } from '../clinics/entities/clinic.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Payment } from '../payments/entities/payment.entity';
import { InvoiceItem } from '../invoices/entities/invoice-item.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { AppointmentType } from '../appointments/entities/appointment-type.entity';
import { ClinicMembership } from '../clinic-memberships/entities/clinic-membership.entity';

import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      User,
      Clinic,
      ClinicMembership,
      Patient,
      Appointment,
      AppointmentType,
      Invoice,
      InvoiceItem,
      Payment,
    ]),
  ],
})
export class SeedModule {}
