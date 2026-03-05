import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

import { NotificationChannel } from '../../common/interfaces/notification-channel.enum';
import { MessageTemplateStatus } from '../interfaces/message-template-status.enum';

export class CreateMessageTemplateDto {
  @IsUUID()
  clinicId: string;

  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(3)
  body: string;

  @IsEnum(MessageTemplateStatus)
  @IsOptional()
  status?: MessageTemplateStatus;
}
