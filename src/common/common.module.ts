import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { I18nHttpExceptionFilter } from './filters/i18n-http-exception.filter';
import { I18nResponseInterceptor } from './interceptors/i18n-response.interceptor';
import { ApiMessageTranslatorService } from './i18n/api-message-translator.service';

import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { Reminder } from '../reminders/entities/reminder.entity';
import { Appointment } from '../appointments/entities/appointment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invoice,
      Payment,
      Appointment,
      Expense,
      Reminder,
    ]),
  ],
  controllers: [CommonController],
  providers: [
    CommonService,
    ApiMessageTranslatorService,
    I18nHttpExceptionFilter,
    I18nResponseInterceptor,
  ],
  exports: [
    ApiMessageTranslatorService,
    I18nHttpExceptionFilter,
    I18nResponseInterceptor,
  ],
})
export class CommonModule {}
