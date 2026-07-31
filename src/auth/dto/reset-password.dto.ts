import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Correo electrónico del usuario',
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '1234',
    description: 'Código OTP de 4 dígitos',
  })
  @IsString()
  @Matches(/^\d{4}$/, { message: 'OTP must be a 4-digit code' })
  otp: string;

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
