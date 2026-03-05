import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetClinicId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.clinicId as string | undefined;
  },
);
