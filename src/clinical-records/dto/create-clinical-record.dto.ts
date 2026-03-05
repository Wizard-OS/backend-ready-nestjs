import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateClinicalRecordDto {
  @IsUUID()
  patientId: string;

  @IsString()
  @IsOptional()
  allergies?: string;

  @IsString()
  @IsOptional()
  chronicDiseases?: string;
}
