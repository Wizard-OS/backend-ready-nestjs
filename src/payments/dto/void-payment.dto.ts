import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VoidPaymentDto {
  @ApiProperty({
    example: 'Pago cargado por error',
    description: 'Motivo de anulación',
  })
  @IsString()
  @MinLength(3)
  reason: string;
}
