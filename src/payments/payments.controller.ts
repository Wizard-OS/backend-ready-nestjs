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

import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { AuthClinic, GetClinicId } from '../auth/decorators';

@ApiTags('Payments')
@ApiBearerAuth()
@ApiSecurity('x-clinic-id')
@Controller('payments')
@AuthClinic()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar pago' })
  @ApiResponse({ status: 201, description: 'Pago registrado' })
  create(
    @GetClinicId() clinicId: string,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return this.paymentsService.create(clinicId, createPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pagos de la clínica' })
  @ApiResponse({ status: 200, description: 'Lista de pagos' })
  findAll(@GetClinicId() clinicId: string) {
    return this.paymentsService.findAll(clinicId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener pago por ID' })
  @ApiParam({ name: 'id', description: 'UUID del pago' })
  @ApiResponse({ status: 200, description: 'Pago encontrado' })
  findOne(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.paymentsService.findOne(clinicId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar pago' })
  @ApiParam({ name: 'id', description: 'UUID del pago' })
  @ApiResponse({ status: 200, description: 'Pago actualizado' })
  update(
    @GetClinicId() clinicId: string,
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return this.paymentsService.update(clinicId, id, updatePaymentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar pago' })
  @ApiParam({ name: 'id', description: 'UUID del pago' })
  @ApiResponse({ status: 200, description: 'Pago eliminado' })
  remove(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.paymentsService.remove(clinicId, id);
  }
}
