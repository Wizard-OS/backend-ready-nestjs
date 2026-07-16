import {
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClinicDto {
  @ApiProperty({
    example: 'Dental Clinic Center',
    description: 'Nombre de la clínica',
  })
  @IsString()
  @Length(2, 120)
  name: string;

  @ApiPropertyOptional({ example: '+59824000000', description: 'Teléfono' })
  @IsString()
  @MaxLength(60)
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    example: 'contacto@dentalhub.com',
    description: 'Email de contacto',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    example: 'Av. 18 de Julio 1234',
    description: 'Dirección',
  })
  @IsString()
  @MaxLength(240)
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/logo.png',
    description: 'URL del logo',
  })
  @IsString()
  @MaxLength(2048)
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({
    example: 'America/Mexico_City',
    description: 'Zona horaria',
  })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional({ example: 'MXN', description: 'Moneda' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({
    example: { monday: [{ from: '09:00', to: '18:00' }] },
    description: 'Horarios generales de atención',
  })
  @IsObject()
  @IsOptional()
  workingHoursJson?: Record<string, unknown>;
}
