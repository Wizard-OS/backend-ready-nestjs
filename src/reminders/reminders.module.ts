import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Reminder } from './entities/reminder.entity';
import { RemindersService } from './reminders.service';
import { RemindersController } from './reminders.controller';

@Module({
  controllers: [RemindersController],
  providers: [RemindersService],
  imports: [TypeOrmModule.forFeature([Reminder])],
  exports: [TypeOrmModule],
})
export class RemindersModule {}
