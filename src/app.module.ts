import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nJsonLoader,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import * as fs from 'fs';
import * as path from 'path';

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
import { HelpCenterModule } from './help-center/help-center.module';
import { OdontogramModule } from './odontogram/odontogram.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { PatientFilesModule } from './patient-files/patient-files.module';
import { UserSessionsModule } from './user-sessions/user-sessions.module';
import { ClinicalNotesModule } from './clinical-notes/clinical-notes.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { ClinicalRecordsModule } from './clinical-records/clinical-records.module';
import { PatientAssignmentsModule } from './patient-assignments/patient-assignments.module';
import { MessageTemplatesModule } from './message-templates/message-templates.module';
import { OutboundMessagesModule } from './outbound-messages/outbound-messages.module';
import { TreatmentSessionsModule } from './treatment-sessions/treatment-sessions.module';
import { ClinicMembershipsModule } from './clinic-memberships/clinic-memberships.module';
import { NotificationPreferencesModule } from './notification-preferences/notification-preferences.module';
import { MembershipModule } from './membership/membership.module';
import { BackofficeModule } from './backoffice/backoffice.module';

function getEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();

  if (!value) {
    return undefined;
  }

  const first = value[0];
  const last = value[value.length - 1];

  if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
    return value.slice(1, -1);
  }

  return value;
}

function getBooleanEnv(name: string): boolean {
  return ['1', 'true', 'yes'].includes(getEnv(name)?.toLowerCase() ?? '');
}

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: path.join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
      },
      renderPath: '/_index',
    }),
    (() => {
      const distI18nPath = path.join(__dirname, 'i18n');
      const srcI18nPath = path.join(process.cwd(), 'src/i18n');
      const i18nPath = fs.existsSync(distI18nPath) ? distI18nPath : srcI18nPath;

      return I18nModule.forRoot({
        fallbackLanguage: 'en',
        loader: I18nJsonLoader,
        loaderOptions: {
          path: i18nPath,
          watch: true,
        },
        resolvers: [
          { use: QueryResolver, options: ['lang'] },
          new HeaderResolver(['x-lang', 'x-custom-lang']),
          AcceptLanguageResolver,
        ],
      });
    })(),
    (() => {
      const databaseUrl = getEnv('DATABASE_URL');
      const ssl =
        getBooleanEnv('DB_SSL') || databaseUrl?.includes('sslmode=require')
          ? { rejectUnauthorized: false }
          : false;
      const synchronize =
        getEnv('DB_SYNCHRONIZE') === undefined
          ? getEnv('NODE_ENV') !== 'production'
          : getEnv('DB_SYNCHRONIZE') !== 'false';

      return TypeOrmModule.forRoot({
        type: 'postgres',
        ...(databaseUrl
          ? { url: databaseUrl }
          : {
              host: getEnv('DB_HOST') || '127.0.0.1',
              port: +(getEnv('DB_PORT') || 5432),
              database: getEnv('DB_NAME') || 'DentalHubDB',
              username: getEnv('DB_USERNAME') || 'postgres',
              password: getEnv('DB_PASSWORD') || 'postgres',
            }),
        ssl,
        autoLoadEntities: true,
        synchronize,
        retryAttempts: 10,
        retryDelay: 3000,
      });
    })(),

    CommonModule,
    BackofficeModule,
    ClinicsModule,
    MembershipModule,
    ClinicMembershipsModule,
    AuthModule,
    SeedModule,
    PatientsModule,
    PatientAssignmentsModule,
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
    OdontogramModule,
    PatientFilesModule,
    RemindersModule,
    NotificationPreferencesModule,
    UserSessionsModule,
    PaymentMethodsModule,
    HelpCenterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
