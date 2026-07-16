import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClinicalNoteDto {
  @ApiProperty({ description: 'UUID del registro clínico' })
  @IsUUID()
  clinicalRecordId: string;

  @ApiProperty({
    example: 'Se realizó limpieza dental profunda',
    description: 'Contenido de la nota clínica',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  content: string;

  @ApiPropertyOptional({ example: 'Dolor al masticar' })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({ example: 'Caries profunda pieza 36' })
  @IsString()
  @IsOptional()
  diagnosis?: string;

  @ApiPropertyOptional({ example: 'Restauración temporal' })
  @IsString()
  @IsOptional()
  procedure?: string;

  @ApiPropertyOptional({ example: 'Control en 7 días' })
  @IsString()
  @IsOptional()
  indications?: string;

  @ApiPropertyOptional({ example: 'Paciente tolera bien el procedimiento' })
  @IsString()
  @IsOptional()
  observations?: string;

  @ApiPropertyOptional({
    example: ['36'],
    description: 'Piezas dentales asociadas a la evolución',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  toothCodes?: string[];
}
