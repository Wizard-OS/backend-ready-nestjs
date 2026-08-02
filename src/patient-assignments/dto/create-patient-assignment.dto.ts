import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreatePatientAssignmentDto {
  @ApiProperty({ description: 'UUID del paciente' })
  @IsUUID()
  patientId: string;

  @ApiProperty({ description: 'UUID de la membresía profesional secundaria' })
  @IsUUID()
  professionalMembershipId: string;
}
