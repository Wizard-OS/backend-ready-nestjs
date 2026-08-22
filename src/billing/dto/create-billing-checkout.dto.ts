import { IsEnum } from 'class-validator';

import { MembershipPlanCode } from '../../membership/interfaces/membership-plan-code.enum';
import { BillingInterval } from '../interfaces/billing-interval.enum';

export class CreateBillingCheckoutDto {
  @IsEnum(MembershipPlanCode)
  planCode: MembershipPlanCode;

  @IsEnum(BillingInterval)
  interval: BillingInterval;
}
