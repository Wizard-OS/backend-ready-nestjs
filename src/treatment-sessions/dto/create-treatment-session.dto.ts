import { IsDateString, IsUUID, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTreatmentSessionDto {
  @ApiProperty({ description: 'UUID del registro clínico' })
  @IsUUID()
  clinicalRecordId: string;

  @ApiProperty({ description: 'UUID del tratamiento' })
  @IsUUID()
  treatmentId: string;

  @ApiProperty({
    example: '1500.00',
    description: 'Precio de la sesión (decimal string)',
  })
  @Matches(/^\d+(\.\d{1,2})?$/)
  price: string;

  @ApiProperty({
    example: '2026-04-12T10:00:00.000Z',
    description: 'Fecha de la sesión (ISO 8601)',
  })
  @IsDateString()
  performedAt: Date;
}
