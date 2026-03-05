import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { OutboundMessagesService } from './outbound-messages.service';
import { CreateOutboundMessageDto } from './dto/create-outbound-message.dto';
import { UpdateOutboundMessageDto } from './dto/update-outbound-message.dto';
import { AuthClinic, GetClinicId } from '../auth/decorators';

@Controller('outbound-messages')
@AuthClinic()
export class OutboundMessagesController {
  constructor(
    private readonly outboundMessagesService: OutboundMessagesService,
  ) {}

  @Post()
  create(
    @GetClinicId() clinicId: string,
    @Body() createOutboundMessageDto: CreateOutboundMessageDto,
  ) {
    return this.outboundMessagesService.create(
      clinicId,
      createOutboundMessageDto,
    );
  }

  @Get()
  findAll(@GetClinicId() clinicId: string) {
    return this.outboundMessagesService.findAll(clinicId);
  }

  @Get(':id')
  findOne(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.outboundMessagesService.findOne(clinicId, id);
  }

  @Patch(':id')
  update(
    @GetClinicId() clinicId: string,
    @Param('id') id: string,
    @Body() updateOutboundMessageDto: UpdateOutboundMessageDto,
  ) {
    return this.outboundMessagesService.update(
      clinicId,
      id,
      updateOutboundMessageDto,
    );
  }

  @Delete(':id')
  remove(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.outboundMessagesService.remove(clinicId, id);
  }
}
