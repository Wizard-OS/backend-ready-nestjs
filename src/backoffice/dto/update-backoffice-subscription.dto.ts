import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { MembershipPlanCode } from '../../membership/interfaces/membership-plan-code.enum';

export class UpdateBackofficeSubscriptionDto {
  @ApiProperty({
    enum: MembershipPlanCode,
    example: MembershipPlanCode.premium,
    description: 'Plan comercial a asignar desde backoffice',
  })
  @IsEnum(MembershipPlanCode)
  planCode: MembershipPlanCode;

  @ApiPropertyOptional({
    example: 'Upgrade manual solicitado por comercial',
    description: 'Motivo auditable del cambio',
  })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  reason?: string;
}
