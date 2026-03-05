import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Min,
} from 'class-validator';

export class CreateAppointmentTypeDto {
  @IsUUID()
  clinicId: string;

  @IsString()
  name: string;

  @IsInt()
  @Min(5)
  durationMin: number;

  @Matches(/^\d+(\.\d{1,2})?$/)
  defaultPrice: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
