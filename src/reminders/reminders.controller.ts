import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { RemindersService } from './reminders.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { AuthClinic, GetClinicId } from '../auth/decorators';

@Controller('reminders')
@AuthClinic()
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  create(
    @GetClinicId() clinicId: string,
    @Body() createReminderDto: CreateReminderDto,
  ) {
    return this.remindersService.create(clinicId, createReminderDto);
  }

  @Get()
  findAll(@GetClinicId() clinicId: string) {
    return this.remindersService.findAll(clinicId);
  }

  @Get(':id')
  findOne(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.remindersService.findOne(clinicId, id);
  }

  @Patch(':id')
  update(
    @GetClinicId() clinicId: string,
    @Param('id') id: string,
    @Body() updateReminderDto: UpdateReminderDto,
  ) {
    return this.remindersService.update(clinicId, id, updateReminderDto);
  }

  @Delete(':id')
  remove(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.remindersService.remove(clinicId, id);
  }
}
