import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { InvoiceItemType } from '../interfaces/invoice-item-type.enum';

export class CreateInvoiceItemDto {
  @ApiProperty({
    enum: InvoiceItemType,
    example: InvoiceItemType.custom,
    description: 'Tipo de ítem',
  })
  @IsEnum(InvoiceItemType)
  type: InvoiceItemType;

  @ApiPropertyOptional({ description: 'UUID de referencia (cita o sesión)' })
  @IsUUID()
  @IsOptional()
  refId?: string;

  @ApiProperty({
    example: 'Consulta general',
    description: 'Descripción del ítem',
  })
  @IsString()
  description: string;

  @ApiProperty({ example: 1, description: 'Cantidad (mín. 1)', minimum: 1 })
  @IsInt()
  @Min(1)
  qty: number;

  @ApiProperty({
    example: '500.00',
    description: 'Precio unitario (decimal string)',
  })
  @Matches(/^\d+(\.\d{1,2})?$/)
  unitPrice: string;
}
