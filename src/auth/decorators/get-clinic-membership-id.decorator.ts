import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetClinicMembershipId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.clinicMembershipId as string | undefined;
  },
);
