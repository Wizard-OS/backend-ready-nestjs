import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPass1', description: 'Contraseña actual' })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  currentPassword: string;

  @ApiProperty({
    example: 'NewPass1',
    description: 'Nueva contraseña (mayúscula, minúscula y número)',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The new password must have an uppercase, lowercase letter and a number',
  })
  newPassword: string;
}
