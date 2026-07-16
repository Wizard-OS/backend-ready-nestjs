import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ToothStatus } from '../interfaces/tooth-status.enum';

export class UpdateOdontogramToothDto {
  @ApiProperty({
    enum: ToothStatus,
    example: ToothStatus.CARIES,
    description: 'Estado de la pieza dental',
  })
  @IsEnum(ToothStatus)
  status: ToothStatus;

  @ApiPropertyOptional({ example: 'Lesión oclusal visible' })
  @IsString()
  @IsOptional()
  observation?: string;

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
