import { IsBoolean, IsOptional, IsString, IsUUID, Matches } from 'class-validator';

export class CreateTreatmentDto {
  @IsString()
  name: string;

  @IsUUID()
  patientId: string;

  @IsUUID()
  doctorId: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Matches(/^\d+(\.\d{1,2})?$/)
  basePrice: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
