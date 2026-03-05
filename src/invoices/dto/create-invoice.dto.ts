import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { InvoiceStatus } from '../InvoiceStatus/InvoiceStatus.enum';
import { CreateInvoiceItemDto } from './create-invoice-item.dto';

export class CreateInvoiceDto {
  @IsUUID()
  clinicId: string;

  @IsUUID()
  patientId: string;

  @IsString()
  number: string;

  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;

  @Matches(/^\d+(\.\d{1,2})?$/)
  subtotal: string;

  @Matches(/^\d+(\.\d{1,2})?$/)
  discount: string;

  @Matches(/^\d+(\.\d{1,2})?$/)
  tax: string;

  @Matches(/^\d+(\.\d{1,2})?$/)
  totalAmount: string;

  @IsDateString()
  @IsOptional()
  dueAt?: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  @IsOptional()
  items?: CreateInvoiceItemDto[];
}
