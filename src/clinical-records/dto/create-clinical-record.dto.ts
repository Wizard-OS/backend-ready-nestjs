import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClinicalRecordDto {
  @ApiProperty({ description: 'UUID del paciente' })
  @IsUUID()
  patientId: string;

  @ApiPropertyOptional({
    example: 'Penicilina',
    description: 'Alergias conocidas',
  })
  @IsString()
  @IsOptional()
  allergies?: string;

  @ApiPropertyOptional({
    example: 'Diabetes tipo 2',
    description: 'Enfermedades crónicas',
  })
  @IsString()
  @IsOptional()
  chronicDiseases?: string;
}
