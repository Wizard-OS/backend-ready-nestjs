import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

import { CreateClinicMembershipDto } from './create-clinic-membership.dto';

export class UpdateClinicMembershipDto extends PartialType(
  CreateClinicMembershipDto,
) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
