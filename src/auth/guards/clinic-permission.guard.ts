import { Reflector } from '@nestjs/core';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { ClinicPermission } from '../interfaces/clinic-permission.enum';
import { ClinicMembershipRole } from '../../clinic-memberships/interfaces/clinic-membership-role.enum';
import { META_CLINIC_PERMISSIONS } from '../decorators/clinic-permissions.decorator';
import { hasClinicPermission } from '../utils/clinic-permissions';

@Injectable()
export class ClinicPermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permissions = this.reflector.getAllAndOverride<ClinicPermission[]>(
      META_CLINIC_PERMISSIONS,
      [context.getHandler(), context.getClass()],
    );

    if (!permissions || permissions.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const role = req.clinicMembershipRole as ClinicMembershipRole | undefined;
    const permissionsJson = req.clinicPermissions as
      | Record<string, boolean>
      | undefined;

    const allowed = permissions.every((permission) =>
      hasClinicPermission(role, permissionsJson, permission),
    );

    if (allowed) return true;

    throw new ForbiddenException(
      `Clinic permissions required: [${permissions.join(', ')}]`,
    );
  }
}
