import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppService } from './app.service';
import { AppController } from './app.controller';

import { AuthModule } from './auth/auth.module';
import { SeedModule } from './seed/seed.module';
import { CommonModule } from './common/common.module';
import { ClinicsModule } from './clinics/clinics.module';
import { ExpensesModule } from './expenses/expenses.module';
import { PatientsModule } from './patients/patients.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentsModule } from './payments/payments.module';
import { RemindersModule } from './reminders/reminders.module';
import { TreatmentsModule } from './treatments/treatments.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ClinicalNotesModule } from './clinical-notes/clinical-notes.module';
import { ClinicalRecordsModule } from './clinical-records/clinical-records.module';
import { MessageTemplatesModule } from './message-templates/message-templates.module';
import { OutboundMessagesModule } from './outbound-messages/outbound-messages.module';
import { TreatmentSessionsModule } from './treatment-sessions/treatment-sessions.module';
import { ClinicMembershipsModule } from './clinic-memberships/clinic-memberships.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || '127.0.0.1',
      port: +(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || 'DentalHubDB',
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      autoLoadEntities: true,
      synchronize: process.env.DB_SYNCHRONIZE !== 'false',
      retryAttempts: 10,
      retryDelay: 3000,
    }),

    CommonModule,
    ClinicsModule,
    ClinicMembershipsModule,
    AuthModule,
    SeedModule,
    PatientsModule,
    AppointmentsModule,
    InvoicesModule,
    PaymentsModule,
    ExpensesModule,
    MessageTemplatesModule,
    OutboundMessagesModule,
    TreatmentsModule,
    ClinicalRecordsModule,
    ClinicalNotesModule,
    TreatmentSessionsModule,
    RemindersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
