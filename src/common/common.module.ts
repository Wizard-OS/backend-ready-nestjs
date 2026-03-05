import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { Reminder } from '../reminders/entities/reminder.entity';

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
  providers: [CommonService],
})
export class CommonModule {}
