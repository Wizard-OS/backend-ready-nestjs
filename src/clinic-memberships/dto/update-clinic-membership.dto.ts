import { PartialType } from '@nestjs/mapped-types';
import { CreateClinicMembershipDto } from './create-clinic-membership.dto';

export class UpdateClinicMembershipDto extends PartialType(
  CreateClinicMembershipDto,
) {}
