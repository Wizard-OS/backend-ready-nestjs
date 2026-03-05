import { IsString, IsUUID, MinLength } from 'class-validator';

export class CreateClinicalNoteDto {
  @IsUUID()
  clinicalRecordId: string;

  @IsString()
  @MinLength(3)
  content: string;
}
