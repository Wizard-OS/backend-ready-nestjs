import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { PaginationDto } from '../../common/dtos/pagination.dto';

export class QueryBackofficeUsersDto extends PaginationDto {
  @ApiPropertyOptional({
    example: 'test@dentalhub.com',
    description: 'Busca por email, nombre o apellido',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    enum: ['active', 'inactive'],
    example: 'active',
    description: 'Filtra usuarios activos o inactivos',
  })
  @IsString()
  @IsOptional()
  status?: 'active' | 'inactive';
}
