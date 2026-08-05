import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

import { CreateClinicDto } from '../../clinics/dto/create-clinic.dto';

export class UpdateBackofficeClinicDto extends PartialType(CreateClinicDto) {
  @ApiPropertyOptional({
    example: true,
    description: 'Estado administrativo de la clínica',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
