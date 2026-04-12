import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';

import { CommonService } from './common.service';
import { AuthClinic, GetClinicId } from '../auth/decorators';

@ApiTags('Common')
@ApiBearerAuth()
@ApiSecurity('x-clinic-id')
@Controller('common')
@AuthClinic()
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Obtener dashboard operativo/financiero de la clínica',
  })
  @ApiResponse({ status: 200, description: 'Datos del dashboard' })
  getDashboard(@GetClinicId() clinicId: string) {
    return this.commonService.getDashboard(clinicId);
  }
}
