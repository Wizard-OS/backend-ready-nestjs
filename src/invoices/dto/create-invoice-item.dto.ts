import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Matches, Min } from 'class-validator';

import { InvoiceItemType } from '../interfaces/invoice-item-type.enum';

export class CreateInvoiceItemDto {
  @IsEnum(InvoiceItemType)
  type: InvoiceItemType;

  @IsUUID()
  @IsOptional()
  refId?: string;

  @IsString()
  description: string;

  @IsInt()
  @Min(1)
  qty: number;

  @Matches(/^\d+(\.\d{1,2})?$/)
  unitPrice: string;
}
