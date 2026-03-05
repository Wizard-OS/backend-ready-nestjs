import { PartialType } from '@nestjs/mapped-types';
import { CreateOutboundMessageDto } from './create-outbound-message.dto';

export class UpdateOutboundMessageDto extends PartialType(
  CreateOutboundMessageDto,
) {}
