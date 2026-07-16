import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../interfaces/payment-method.enum';

export class CreatePaymentDto {
  @ApiProperty({ description: 'UUID de la factura' })
  @IsUUID()
  invoiceId: string;

  @ApiPropertyOptional({ description: 'UUID del paciente' })
  @IsUUID()
  @IsOptional()
  patientId?: string;

  @ApiPropertyOptional({ description: 'UUID del tratamiento' })
  @IsUUID()
  @IsOptional()
  treatmentId?: string;

  @ApiProperty({
    example: '500.00',
    description: 'Monto del pago (decimal string)',
  })
  @Matches(/^\d+(\.\d{1,2})?$/)
  amount: string;

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.CASH,
    description: 'Método de pago',
  })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({
    example: '2026-04-12T10:00:00.000Z',
    description: 'Fecha del pago (ISO 8601)',
  })
  @IsDateString()
  paidAt: Date;

  @ApiPropertyOptional({
    example: 'REF-12345',
    description: 'Referencia del pago',
  })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiPropertyOptional({
    description: 'UUID de la membresía que recibió el pago',
  })
  @IsUUID()
  @IsOptional()
  receivedByMembershipId?: string;
}
