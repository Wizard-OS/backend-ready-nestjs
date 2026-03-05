import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { CreateInvoiceItemDto } from './dto/create-invoice-item.dto';
import { AuthClinic, GetClinicId } from '../auth/decorators';

@Controller('invoices')
@AuthClinic()
export class InvoicesController {
  constructor(private readonly invoiceService: InvoicesService) {}

  @Post()
  create(
    @GetClinicId() clinicId: string,
    @Body() createInvoiceDto: CreateInvoiceDto,
  ) {
    return this.invoiceService.create(clinicId, createInvoiceDto);
  }

  @Get()
  findAll(@GetClinicId() clinicId: string) {
    return this.invoiceService.findAll(clinicId);
  }

  @Get(':id')
  findOne(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.invoiceService.findOne(clinicId, id);
  }

  @Patch(':id')
  update(
    @GetClinicId() clinicId: string,
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ) {
    return this.invoiceService.update(clinicId, id, updateInvoiceDto);
  }

  @Delete(':id')
  remove(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.invoiceService.remove(clinicId, id);
  }

  @Post(':id/items')
  addItem(
    @GetClinicId() clinicId: string,
    @Param('id') id: string,
    @Body() createInvoiceItemDto: CreateInvoiceItemDto,
  ) {
    return this.invoiceService.addItem(clinicId, id, createInvoiceItemDto);
  }

  @Delete(':invoiceId/items/:itemId')
  removeItem(
    @GetClinicId() clinicId: string,
    @Param('invoiceId') invoiceId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.invoiceService.removeItem(clinicId, invoiceId, itemId);
  }
}
