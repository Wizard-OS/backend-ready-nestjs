import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { MessageTemplatesService } from './message-templates.service';
import { CreateMessageTemplateDto } from './dto/create-message-template.dto';
import { UpdateMessageTemplateDto } from './dto/update-message-template.dto';
import { AuthClinic, GetClinicId } from '../auth/decorators';

@Controller('message-templates')
@AuthClinic()
export class MessageTemplatesController {
  constructor(
    private readonly messageTemplatesService: MessageTemplatesService,
  ) {}

  @Post()
  create(
    @GetClinicId() clinicId: string,
    @Body() createMessageTemplateDto: CreateMessageTemplateDto,
  ) {
    return this.messageTemplatesService.create(
      clinicId,
      createMessageTemplateDto,
    );
  }

  @Get()
  findAll(@GetClinicId() clinicId: string) {
    return this.messageTemplatesService.findAll(clinicId);
  }

  @Get(':id')
  findOne(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.messageTemplatesService.findOne(clinicId, id);
  }

  @Patch(':id')
  update(
    @GetClinicId() clinicId: string,
    @Param('id') id: string,
    @Body() updateMessageTemplateDto: UpdateMessageTemplateDto,
  ) {
    return this.messageTemplatesService.update(
      clinicId,
      id,
      updateMessageTemplateDto,
    );
  }

  @Delete(':id')
  remove(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.messageTemplatesService.remove(clinicId, id);
  }
}
