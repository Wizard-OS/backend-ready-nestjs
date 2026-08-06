import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateOdontogramPdfDto {
  @ApiPropertyOptional({ description: 'UUID de la cita asociada' })
  @IsUUID()
  @IsOptional()
  appointmentId?: string;

  @ApiPropertyOptional({ description: 'UUID de la evolución clínica asociada' })
  @IsUUID()
  @IsOptional()
  clinicalNoteId?: string;

  @ApiPropertyOptional({ description: 'UUID del tratamiento asociado' })
  @IsUUID()
  @IsOptional()
  treatmentId?: string;

  @ApiPropertyOptional({ example: 'Odontograma inicial exportado' })
  @IsString()
  @IsOptional()
  description?: string;
}
