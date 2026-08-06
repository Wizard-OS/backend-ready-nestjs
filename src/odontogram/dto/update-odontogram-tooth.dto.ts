import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ToothStatus } from '../interfaces/tooth-status.enum';
import { ToothSurface } from '../interfaces/tooth-surface.enum';

export class UpdateOdontogramToothDto {
  @ApiProperty({
    enum: ToothStatus,
    example: ToothStatus.CARIES,
    description: 'Estado de la pieza dental',
  })
  @IsEnum(ToothStatus)
  status: ToothStatus;

  @ApiPropertyOptional({
    enum: ToothSurface,
    isArray: true,
    example: [ToothSurface.OCCLUSAL],
    description:
      'Superficies afectadas. Si se omite, se registra la pieza completa.',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(ToothSurface, { each: true })
  @IsOptional()
  surfaces?: ToothSurface[];

  @ApiPropertyOptional({ example: 'Lesión oclusal visible' })
  @IsString()
  @IsOptional()
  observation?: string;

  @ApiPropertyOptional({ example: 'Caries inicial en fosa central' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Restauración de resina' })
  @IsString()
  @IsOptional()
  treatmentType?: string;

  @ApiPropertyOptional({
    description: 'UUID de la evolución clínica asociada',
  })
  @IsUUID()
  @IsOptional()
  clinicalNoteId?: string;

  @ApiPropertyOptional({
    description: 'UUID del tratamiento asociado',
  })
  @IsUUID()
  @IsOptional()
  treatmentId?: string;
}
