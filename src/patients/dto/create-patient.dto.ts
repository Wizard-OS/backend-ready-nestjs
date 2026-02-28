import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

import { Gender } from '../../common/interfaces/gender.enum';

export class CreatePatientDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  surnames: string;

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
