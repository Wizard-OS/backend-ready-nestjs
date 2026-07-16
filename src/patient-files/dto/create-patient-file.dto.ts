import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { PatientFileType } from '../interfaces/patient-file-type.enum';

export class CreatePatientFileDto {
  @ApiPropertyOptional({
    enum: PatientFileType,
    example: PatientFileType.RADIOGRAPHY,
  })
  @IsEnum(PatientFileType)
  @IsOptional()
  type?: PatientFileType;

  @ApiPropertyOptional({ example: 'Radiografía panorámica inicial' })
  @IsString()
  @IsOptional()
  description?: string;

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
}
