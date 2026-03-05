import { IsOptional, IsString, Length } from 'class-validator';

export class CreateClinicDto {
  @IsString()
  @Length(2, 120)
  name: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  currency?: string;
}
