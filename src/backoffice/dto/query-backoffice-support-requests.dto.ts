import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { PaginationDto } from '../../common/dtos/pagination.dto';
import { SupportRequestStatus } from '../../help-center/entities/support-request.entity';

export class QueryBackofficeSupportRequestsDto extends PaginationDto {
  @ApiPropertyOptional({
    example: 'facturación',
    description: 'Busca por asunto, mensaje o email de contacto',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    enum: SupportRequestStatus,
    example: SupportRequestStatus.OPEN,
    description: 'Filtra por estado de solicitud',
  })
  @IsEnum(SupportRequestStatus)
  @IsOptional()
  status?: SupportRequestStatus;
}
