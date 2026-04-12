import { IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClinicDto {
  @ApiProperty({
    example: 'Dental Clinic Center',
    description: 'Nombre de la clínica',
  })
  @IsString()
  @Length(2, 120)
  name: string;

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
}
