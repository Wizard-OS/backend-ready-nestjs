import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TreatmentSessionsService } from './treatment-sessions.service';
import { CreateTreatmentSessionDto } from './dto/create-treatment-session.dto';
import { UpdateTreatmentSessionDto } from './dto/update-treatment-session.dto';

@Controller('treatment-sessions')
export class TreatmentSessionsController {
  constructor(private readonly treatmentSessionsService: TreatmentSessionsService) {}

  @Post()
  create(@Body() createTreatmentSessionDto: CreateTreatmentSessionDto) {
    return this.treatmentSessionsService.create(createTreatmentSessionDto);
  }

  @Get()
  findAll() {
    return this.treatmentSessionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.treatmentSessionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTreatmentSessionDto: UpdateTreatmentSessionDto) {
    return this.treatmentSessionsService.update(+id, updateTreatmentSessionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.treatmentSessionsService.remove(+id);
  }
}
