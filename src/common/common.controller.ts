import { Controller, Get } from '@nestjs/common';

import { CommonService } from './common.service';
import { AuthClinic, GetClinicId } from '../auth/decorators';

@Controller('common')
@AuthClinic()
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Get('dashboard')
  getDashboard(@GetClinicId() clinicId: string) {
    return this.commonService.getDashboard(clinicId);
  }
}
