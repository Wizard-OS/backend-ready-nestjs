import { IsEnum, IsObject, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ClinicMembershipRole } from '../interfaces/clinic-membership-role.enum';

export class CreateClinicMembershipDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID de la clínica',
  })
  @IsUUID()
  clinicId: string;

  @ApiProperty({
    example: 'f1e2d3c4-b5a6-7890-abcd-ef1234567890',
    description: 'UUID del usuario',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    enum: ClinicMembershipRole,
    example: ClinicMembershipRole.odontologist,
    description: 'Rol en la clínica',
  })
  @IsEnum(ClinicMembershipRole)
  role: ClinicMembershipRole;

  @ApiPropertyOptional({
    example: { canEdit: true },
    description: 'Permisos personalizados en JSON',
  })
  @IsObject()
  @IsOptional()
  permissionsJson?: Record<string, boolean>;
}
