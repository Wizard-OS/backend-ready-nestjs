import { IsEmail, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
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
}
