import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';

import { Payment } from './entities/payment.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InvoiceStatus } from '../invoices/InvoiceStatus/InvoiceStatus.enum';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  async create(clinicId: string, dto: CreatePaymentDto) {
    const invoice = await this.findInvoiceInClinic(dto.invoiceId, clinicId);

    const paidAmount = await this.getPaidAmount(invoice.id);
    const nextPaidAmount = paidAmount + Number(dto.amount);

    if (nextPaidAmount > Number(invoice.totalAmount)) {
      throw new BadRequestException(
        'Payment amount exceeds pending invoice balance',
      );
    }

    const payment = this.paymentRepository.create(dto);
    await this.paymentRepository.save(payment);

    await this.refreshInvoiceStatus(invoice.id);

    return await this.findOne(clinicId, payment.id);
  }

  async findAll(clinicId: string) {
    return await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.invoice', 'invoice')
      .where('invoice.clinicId = :clinicId', { clinicId })
      .orderBy('payment.paidAt', 'DESC')
      .getMany();
  }

  async findOne(clinicId: string, id: string) {
    if (!isUUID(id)) throw new BadRequestException('Invalid payment id');

    const payment = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.invoice', 'invoice')
      .where('payment.id = :id', { id })
      .andWhere('invoice.clinicId = :clinicId', { clinicId })
      .getOne();

    if (!payment) {
      throw new NotFoundException(`Payment with id ${id} not found`);
    }

    return payment;
  }

  async update(clinicId: string, id: string, dto: UpdatePaymentDto) {
    const payment = await this.findOne(clinicId, id);

    const invoice = await this.findInvoiceInClinic(payment.invoiceId, clinicId);

    const paidWithoutCurrent =
      (await this.getPaidAmount(invoice.id)) - Number(payment.amount);
    const nextAmount = Number(dto.amount ?? payment.amount);

    if (paidWithoutCurrent + nextAmount > Number(invoice.totalAmount)) {
      throw new BadRequestException(
        'Payment amount exceeds pending invoice balance',
      );
    }

    Object.assign(payment, dto);
    const saved = await this.paymentRepository.save(payment);

    await this.refreshInvoiceStatus(invoice.id);

    return saved;
  }

  async remove(clinicId: string, id: string) {
    const payment = await this.findOne(clinicId, id);

    await this.paymentRepository.remove(payment);
    await this.refreshInvoiceStatus(payment.invoiceId);

    return { message: `Payment ${id} removed` };
  }

  private async findInvoiceInClinic(invoiceId: string, clinicId: string) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId, clinicId },
    });

    if (!invoice) {
      throw new BadRequestException('Invoice does not belong to clinic scope');
    }

    return invoice;
  }

  private async getPaidAmount(invoiceId: string) {
    const payments = await this.paymentRepository.find({
      where: { invoiceId },
      select: { amount: true },
    });

    return payments.reduce((acc, payment) => acc + Number(payment.amount), 0);
  }

  private async refreshInvoiceStatus(invoiceId: string) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
    });

    if (!invoice || invoice.status === InvoiceStatus.CANCELLED) return;

    const paidAmount = await this.getPaidAmount(invoiceId);
    const total = Number(invoice.totalAmount);

    if (paidAmount >= total && total > 0) {
      invoice.status = InvoiceStatus.PAID;
    } else if (paidAmount > 0) {
      invoice.status = InvoiceStatus.PARTIALLY_PAID;
    } else if (invoice.dueAt && new Date(invoice.dueAt) < new Date()) {
      invoice.status = InvoiceStatus.OVERDUE;
    } else {
      invoice.status = InvoiceStatus.PENDING;
    }

    await this.invoiceRepository.save(invoice);
  }
}
