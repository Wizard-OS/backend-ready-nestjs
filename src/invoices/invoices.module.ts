import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Patient } from '../patients/entities/patient.entity';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';

@Module({
  controllers: [InvoicesController],
  providers: [InvoicesService],
  imports: [TypeOrmModule.forFeature([Invoice, InvoiceItem, Patient])],
  exports: [TypeOrmModule],
})
export class InvoicesModule {}
