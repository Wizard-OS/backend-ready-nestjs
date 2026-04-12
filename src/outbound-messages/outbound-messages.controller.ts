import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiSecurity,
  ApiParam,
} from '@nestjs/swagger';

import { OutboundMessagesService } from './outbound-messages.service';
import { CreateOutboundMessageDto } from './dto/create-outbound-message.dto';
import { UpdateOutboundMessageDto } from './dto/update-outbound-message.dto';
import { AuthClinic, GetClinicId } from '../auth/decorators';

@ApiTags('Outbound Messages')
@ApiBearerAuth()
@ApiSecurity('x-clinic-id')
@Controller('outbound-messages')
@AuthClinic()
export class OutboundMessagesController {
  constructor(
    private readonly outboundMessagesService: OutboundMessagesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear mensaje saliente' })
  @ApiResponse({ status: 201, description: 'Mensaje creado' })
  create(
    @GetClinicId() clinicId: string,
    @Body() createOutboundMessageDto: CreateOutboundMessageDto,
  ) {
    return this.outboundMessagesService.create(
      clinicId,
      createOutboundMessageDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Listar mensajes salientes' })
  @ApiResponse({ status: 200, description: 'Lista de mensajes salientes' })
  findAll(@GetClinicId() clinicId: string) {
    return this.outboundMessagesService.findAll(clinicId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener mensaje saliente por ID' })
  @ApiParam({ name: 'id', description: 'UUID del mensaje' })
  @ApiResponse({ status: 200, description: 'Mensaje encontrado' })
  findOne(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.outboundMessagesService.findOne(clinicId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar mensaje saliente' })
  @ApiParam({ name: 'id', description: 'UUID del mensaje' })
  @ApiResponse({ status: 200, description: 'Mensaje actualizado' })
  update(
    @GetClinicId() clinicId: string,
    @Param('id') id: string,
    @Body() updateOutboundMessageDto: UpdateOutboundMessageDto,
  ) {
    return this.outboundMessagesService.update(
      clinicId,
      id,
      updateOutboundMessageDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar mensaje saliente' })
  @ApiParam({ name: 'id', description: 'UUID del mensaje' })
  @ApiResponse({ status: 200, description: 'Mensaje eliminado' })
  remove(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.outboundMessagesService.remove(clinicId, id);
  }
}
