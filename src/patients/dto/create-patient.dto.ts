import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { Gender } from '../../common/interfaces/gender.enum';

export class CreatePatientDto {
  @IsUUID()
  clinicId: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsDateString()
  birthDate: Date;

  @IsEnum(Gender, {
    message: 'gender must be a valid enum value',
  })
  gender: Gender;

  @IsString()
  @IsOptional()
  address: string;

  @IsString()
  @IsOptional()
  phone: string;
}
