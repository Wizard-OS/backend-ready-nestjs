import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';

import { ReminderType } from '../interfaces/reminder-type.enum';
import { NotificationChannel } from '../../common/interfaces/notification-channel.enum';
import { ReminderStatus } from '../interfaces/reminder-status.enum';

export class CreateReminderDto {
  @IsUUID()
  appointmentId: string;

  @IsUUID()
  @IsOptional()
  templateId?: string;

  @IsEnum(ReminderType)
  @IsOptional()
  type?: ReminderType;

  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @IsEnum(ReminderStatus)
  @IsOptional()
  status?: ReminderStatus;

  @IsDateString()
  scheduledAt: Date;
}
