import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethodType } from '../entities/payment-method.entity';

export class CreatePaymentMethodDto {
  @ApiProperty({
    enum: PaymentMethodType,
    example: PaymentMethodType.CARD,
    description: 'Tipo de método de pago',
  })
  @IsEnum(PaymentMethodType)
  type: PaymentMethodType;

  @ApiProperty({
    example: 'Visa ****1234',
    description: 'Etiqueta del método de pago',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  label: string;

  @ApiPropertyOptional({
    example: '1234',
    description: 'Últimos 4 dígitos',
    maxLength: 4,
  })
  @IsOptional()
  @IsString()
  @MaxLength(4)
  last4?: string;

  @ApiPropertyOptional({
    example: 12,
    description: 'Mes de expiración (1-12)',
    minimum: 1,
    maximum: 12,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  expiryMonth?: number;

  @ApiPropertyOptional({
    example: 2028,
    description: 'Año de expiración',
    minimum: 2024,
    maximum: 2100,
  })
  @IsOptional()
  @IsInt()
  @Min(2024)
  @Max(2100)
  expiryYear?: number;
}
