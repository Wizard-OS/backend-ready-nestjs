import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ReminderType } from '../interfaces/reminder-type.enum';
import { NotificationChannel } from '../../common/interfaces/notification-channel.enum';
import { ReminderStatus } from '../interfaces/reminder-status.enum';

export class CreateReminderDto {
  @ApiProperty({ description: 'UUID de la cita' })
  @IsUUID()
  appointmentId: string;

  @ApiPropertyOptional({ description: 'UUID de la plantilla de mensaje' })
  @IsUUID()
  @IsOptional()
  templateId?: string;

  @ApiPropertyOptional({
    enum: ReminderType,
    example: ReminderType.EMAIL,
    description: 'Tipo de recordatorio',
  })
  @IsEnum(ReminderType)
  @IsOptional()
  type?: ReminderType;

  @ApiProperty({
    enum: NotificationChannel,
    example: NotificationChannel.EMAIL,
    description: 'Canal de notificación',
  })
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @ApiPropertyOptional({
    enum: ReminderStatus,
    example: ReminderStatus.SCHEDULED,
    description: 'Estado del recordatorio',
  })
  @IsEnum(ReminderStatus)
  @IsOptional()
  status?: ReminderStatus;

  @ApiProperty({
    example: '2026-04-14T08:00:00.000Z',
    description: 'Fecha/hora programada (ISO 8601)',
  })
  @IsDateString()
  scheduledAt: Date;
}
