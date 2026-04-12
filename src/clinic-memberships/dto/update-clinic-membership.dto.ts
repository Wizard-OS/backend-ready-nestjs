import { PartialType } from '@nestjs/swagger';
import { CreateClinicMembershipDto } from './create-clinic-membership.dto';

export class UpdateClinicMembershipDto extends PartialType(
  CreateClinicMembershipDto,
) {}
