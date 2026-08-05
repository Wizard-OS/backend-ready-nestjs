import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
} from 'class-validator';

import { ValidRoles } from '../../auth/interfaces';

export class UpdateBackofficeUserDto {
  @ApiPropertyOptional({
    example: true,
    description: 'Estado administrativo del usuario',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    enum: ValidRoles,
    isArray: true,
    example: [ValidRoles.superUser],
    description: 'Roles globales del usuario',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(ValidRoles, { each: true })
  @IsOptional()
  roles?: ValidRoles[];
}
