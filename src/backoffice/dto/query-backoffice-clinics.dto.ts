import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { PaginationDto } from '../../common/dtos/pagination.dto';
import { MembershipPlanCode } from '../../membership/interfaces/membership-plan-code.enum';

export class QueryBackofficeClinicsDto extends PaginationDto {
  @ApiPropertyOptional({
    example: 'Dental Hub',
    description: 'Busca por nombre, email o teléfono de clínica',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    enum: ['active', 'inactive'],
    example: 'active',
    description: 'Filtra clínicas activas o inactivas',
  })
  @IsString()
  @IsOptional()
  status?: 'active' | 'inactive';

  @ApiPropertyOptional({
    enum: MembershipPlanCode,
    example: MembershipPlanCode.premium,
    description: 'Filtra por plan comercial actual',
  })
  @IsEnum(MembershipPlanCode)
  @IsOptional()
  planCode?: MembershipPlanCode;
}
