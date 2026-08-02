import { SetMetadata } from '@nestjs/common';

import { ClinicPermission } from '../interfaces/clinic-permission.enum';

export const META_CLINIC_PERMISSIONS = 'clinicPermissions';

export const ClinicPermissions = (...permissions: ClinicPermission[]) => {
  return SetMetadata(META_CLINIC_PERMISSIONS, permissions);
};
