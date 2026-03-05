import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Invoice } from '../invoices/entities/invoice.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { Reminder } from '../reminders/entities/reminder.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { InvoiceStatus } from '../invoices/InvoiceStatus/InvoiceStatus.enum';
import { ReminderStatus } from '../reminders/interfaces/reminder-status.enum';
import { DashboardResponse } from './interfaces/dashboard-response.interface';

@Injectable()
export class CommonService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,

    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,

    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,

    @InjectRepository(Reminder)
    private readonly reminderRepository: Repository<Reminder>,
  ) {}

  async getDashboard(clinicId: string): Promise<DashboardResponse> {
    const [invoices, payments, appointments, expenses, reminders] =
      await Promise.all([
        this.invoiceRepository.find({ where: { clinicId } }),
        this.paymentRepository
          .createQueryBuilder('payment')
          .innerJoin('payment.invoice', 'invoice')
          .where('invoice.clinicId = :clinicId', { clinicId })
          .getMany(),
        this.appointmentRepository.find({ where: { clinicId } }),
        this.expenseRepository.find({ where: { clinicId } }),
        this.reminderRepository
          .createQueryBuilder('reminder')
          .innerJoin('reminder.appointment', 'appointment')
          .where('appointment.clinicId = :clinicId', { clinicId })
          .getMany(),
      ]);

    const invoiceTotal = invoices.reduce(
      (acc, item) => acc + Number(item.totalAmount),
      0,
    );
    const paidTotal = payments.reduce(
      (acc, item) => acc + Number(item.amount),
      0,
    );
    const expenseTotal = expenses.reduce(
      (acc, item) => acc + Number(item.amount),
      0,
    );

    const invoicesByStatus = {
      pending: invoices.filter((i) => i.status === InvoiceStatus.PENDING)
        .length,
      partiallyPaid: invoices.filter(
        (i) => i.status === InvoiceStatus.PARTIALLY_PAID,
      ).length,
      paid: invoices.filter((i) => i.status === InvoiceStatus.PAID).length,
      overdue: invoices.filter((i) => i.status === InvoiceStatus.OVERDUE)
        .length,
    };

    const remindersByStatus = {
      scheduled: reminders.filter((r) => r.status === ReminderStatus.SCHEDULED)
        .length,
      sent: reminders.filter((r) => r.status === ReminderStatus.SENT).length,
      failed: reminders.filter((r) => r.status === ReminderStatus.FAILED)
        .length,
    };

    return {
      financial: {
        invoiceTotal: invoiceTotal.toFixed(2),
        paidTotal: paidTotal.toFixed(2),
        expenseTotal: expenseTotal.toFixed(2),
        netTotal: (paidTotal - expenseTotal).toFixed(2),
        pendingReceivable: (invoiceTotal - paidTotal).toFixed(2),
      },
      operations: {
        appointments: appointments.length,
        reminders: reminders.length,
        invoices: invoices.length,
        expenses: expenses.length,
      },
      breakdown: {
        invoicesByStatus,
        remindersByStatus,
      },
      generatedAt: new Date().toISOString(),
    };
  }
}
