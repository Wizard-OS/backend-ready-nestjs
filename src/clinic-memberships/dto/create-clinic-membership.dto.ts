import { IsEnum, IsObject, IsOptional, IsUUID } from 'class-validator';

import { ClinicMembershipRole } from '../interfaces/clinic-membership-role.enum';

export class CreateClinicMembershipDto {
  @IsUUID()
  clinicId: string;

  @IsUUID()
  userId: string;

  @IsEnum(ClinicMembershipRole)
  role: ClinicMembershipRole;

  @IsObject()
  @IsOptional()
  permissionsJson?: Record<string, boolean>;
}
