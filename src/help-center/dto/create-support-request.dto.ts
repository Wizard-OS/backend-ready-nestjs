import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupportRequestDto {
  @ApiProperty({
    example: 'Problema con facturación',
    description: 'Asunto de la solicitud',
    minLength: 3,
    maxLength: 200,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  subject: string;

  @ApiProperty({
    example: 'No puedo generar facturas desde ayer...',
    description: 'Mensaje detallado',
    minLength: 10,
    maxLength: 2000,
  })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  message: string;

  @ApiPropertyOptional({
    example: 'contacto@email.com',
    description: 'Email de contacto alternativo',
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  contactEmail?: string;
}
