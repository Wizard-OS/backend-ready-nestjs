import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { ClinicMembershipsService } from './clinic-memberships.service';
import { CreateClinicMembershipDto } from './dto/create-clinic-membership.dto';
import { UpdateClinicMembershipDto } from './dto/update-clinic-membership.dto';

@Controller('clinic-memberships')
@Auth(ValidRoles.admin)
export class ClinicMembershipsController {
  constructor(
    private readonly clinicMembershipsService: ClinicMembershipsService,
  ) {}

  @Post()
  create(@Body() createClinicMembershipDto: CreateClinicMembershipDto) {
    return this.clinicMembershipsService.create(createClinicMembershipDto);
  }

  @Get()
  findAll(@Query('clinicId') clinicId?: string) {
    return this.clinicMembershipsService.findAll(clinicId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clinicMembershipsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateClinicMembershipDto: UpdateClinicMembershipDto,
  ) {
    return this.clinicMembershipsService.update(id, updateClinicMembershipDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clinicMembershipsService.remove(id);
  }
}
