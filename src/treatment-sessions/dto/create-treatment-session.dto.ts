import { IsDateString, IsUUID, Matches } from 'class-validator';

export class CreateTreatmentSessionDto {
  @IsUUID()
  clinicalRecordId: string;

  @IsUUID()
  treatmentId: string;

  @Matches(/^\d+(\.\d{1,2})?$/)
  price: string;

  @IsDateString()
  performedAt: Date;
}
