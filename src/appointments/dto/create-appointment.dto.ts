import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { AppointmentStatus } from '../interfaces/AppointmentStatus.enum';

export class CreateAppointmentDto {
  @IsUUID()
  clinicId: string;

  @IsUUID()
  patientId: string;

  @IsUUID()
  @IsOptional()
  dentistId?: string;

  @IsUUID()
  @IsOptional()
  professionalMembershipId?: string;

  @IsUUID()
  @IsOptional()
  appointmentTypeId?: string;

  @IsString()
  description: string;

  @IsDateString()
  startTime: Date;

  @IsDateString()
  endTime: Date;

  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  cancelReason?: string;

  @IsUUID()
  @IsOptional()
  createdByMembershipId?: string;
}
