import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TreatmentStatus } from '../interfaces/treatment-status.enum';

export class CreateTreatmentDto {
  @ApiProperty({ example: 'Ortodoncia', description: 'Nombre del tratamiento' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'UUID del paciente' })
  @IsUUID()
  patientId: string;

  @ApiProperty({ description: 'UUID del doctor' })
  @IsUUID()
  doctorId: string;

  @ApiPropertyOptional({
    description: 'UUID de la membresía del profesional responsable',
  })
  @IsUUID()
  @IsOptional()
  professionalMembershipId?: string;

  @ApiPropertyOptional({ example: '36', description: 'Pieza dental opcional' })
  @IsString()
  @IsOptional()
  toothCode?: string;

  @ApiPropertyOptional({
    example: 'Tratamiento de brackets metálicos',
    description: 'Descripción',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: '15000.00',
    description: 'Precio base (decimal string)',
  })
  @Matches(/^\d+(\.\d{1,2})?$/)
  basePrice: string;

  @ApiPropertyOptional({
    enum: TreatmentStatus,
    example: TreatmentStatus.PROPOSED,
    description: 'Estado del plan de tratamiento',
  })
  @IsEnum(TreatmentStatus)
  @IsOptional()
  status?: TreatmentStatus;

  @ApiPropertyOptional({
    description: 'UUID del presupuesto/factura relacionado',
  })
  @IsUUID()
  @IsOptional()
  invoiceId?: string;

  @ApiPropertyOptional({ example: true, description: '¿Activo?' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
