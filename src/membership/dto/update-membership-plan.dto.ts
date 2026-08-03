import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { MembershipPlanCode } from '../interfaces/membership-plan-code.enum';

export class UpdateMembershipPlanDto {
  @ApiProperty({
    enum: MembershipPlanCode,
    example: MembershipPlanCode.premium,
    description: 'Plan comercial a asignar manualmente',
  })
  @IsEnum(MembershipPlanCode)
  planCode: MembershipPlanCode;

  @ApiPropertyOptional({
    example: 'Upgrade manual MVP',
    description: 'Motivo auditable del cambio manual',
  })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  reason?: string;
}
