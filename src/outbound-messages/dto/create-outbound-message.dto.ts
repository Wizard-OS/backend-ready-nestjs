import { IsEnum, IsObject, IsOptional, IsUUID } from 'class-validator';

import { NotificationChannel } from '../../common/interfaces/notification-channel.enum';
import { OutboundMessageStatus } from '../interfaces/outbound-message-status.enum';

export class CreateOutboundMessageDto {
  @IsUUID()
  clinicId: string;

  @IsUUID()
  @IsOptional()
  patientId?: string;

  @IsUUID()
  @IsOptional()
  appointmentId?: string;

  @IsUUID()
  @IsOptional()
  templateId?: string;

  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @IsObject()
  @IsOptional()
  payloadJson?: Record<string, unknown>;

  @IsEnum(OutboundMessageStatus)
  @IsOptional()
  status?: OutboundMessageStatus;
}
