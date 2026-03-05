import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Reminder } from './entities/reminder.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { MessageTemplate } from '../message-templates/entities/message-template.entity';
import { RemindersService } from './reminders.service';
import { RemindersController } from './reminders.controller';

@Module({
  controllers: [RemindersController],
  providers: [RemindersService],
  imports: [TypeOrmModule.forFeature([Reminder, Appointment, MessageTemplate])],
  exports: [TypeOrmModule],
})
export class RemindersModule {}
