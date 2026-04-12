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
import { PaymentMethodType } from '../entities/payment-method.entity';

export class CreatePaymentMethodDto {
  @IsEnum(PaymentMethodType)
  type: PaymentMethodType;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  label: string;

  @IsOptional()
  @IsString()
  @MaxLength(4)
  last4?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  expiryMonth?: number;

  @IsOptional()
  @IsInt()
  @Min(2024)
  @Max(2100)
  expiryYear?: number;
}
