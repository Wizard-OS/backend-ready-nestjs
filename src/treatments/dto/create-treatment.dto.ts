import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTreatmentDto {
  @ApiProperty({ example: 'Ortodoncia', description: 'Nombre del tratamiento' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'UUID del paciente' })
  @IsUUID()
  patientId: string;

  @ApiProperty({ description: 'UUID del doctor' })
  @IsUUID()
  doctorId: string;

  @ApiPropertyOptional({
    example: 'Tratamiento de brackets metálicos',
    description: 'Descripción',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: '15000.00',
    description: 'Precio base (decimal string)',
  })
  @Matches(/^\d+(\.\d{1,2})?$/)
  basePrice: string;

  @ApiPropertyOptional({ example: true, description: '¿Activo?' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
