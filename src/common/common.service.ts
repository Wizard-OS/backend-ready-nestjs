import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Invoice } from '../invoices/entities/invoice.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { Reminder } from '../reminders/entities/reminder.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Treatment } from '../treatments/entities/treatment.entity';
import { InvoiceStatus } from '../invoices/InvoiceStatus/InvoiceStatus.enum';
import { ReminderStatus } from '../reminders/interfaces/reminder-status.enum';
import { DashboardResponse } from './interfaces/dashboard-response.interface';
import { TreatmentStatus } from '../treatments/interfaces/treatment-status.enum';

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

    @InjectRepository(Treatment)
    private readonly treatmentRepository: Repository<Treatment>,
  ) {}

  async getDashboard(clinicId: string): Promise<DashboardResponse> {
    const [invoices, payments, appointments, expenses, reminders] =
      await Promise.all([
        this.invoiceRepository.find({ where: { clinicId } }),
        this.paymentRepository
          .createQueryBuilder('payment')
          .innerJoin('payment.invoice', 'invoice')
          .where('invoice.clinicId = :clinicId', { clinicId })
          .andWhere('payment.voidedAt IS NULL')
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

  async getAppointmentsReport(
    clinicId: string,
    filters: {
      from?: string;
      to?: string;
      status?: string;
      professionalMembershipId?: string;
    },
  ) {
    const query = this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('appointment.appointmentType', 'appointmentType')
      .leftJoinAndSelect(
        'appointment.professionalMembership',
        'professionalMembership',
      )
      .where('appointment.clinicId = :clinicId', { clinicId });

    if (filters.from) {
      query.andWhere('appointment.startTime >= :from', {
        from: filters.from,
      });
    }

    if (filters.to) {
      query.andWhere('appointment.startTime <= :to', { to: filters.to });
    }

    if (filters.status !== undefined) {
      query.andWhere('appointment.status = :status', {
        status: Number.isNaN(Number(filters.status))
          ? filters.status
          : Number(filters.status),
      });
    }

    if (filters.professionalMembershipId) {
      query.andWhere(
        'appointment.professionalMembershipId = :professionalMembershipId',
        { professionalMembershipId: filters.professionalMembershipId },
      );
    }

    const appointments = await query
      .orderBy('appointment.startTime', 'ASC')
      .getMany();

    const byStatus = appointments.reduce<Record<string, number>>(
      (acc, appointment) => {
        const key = String(appointment.status);
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      },
      {},
    );

    return {
      total: appointments.length,
      byStatus,
      appointments,
    };
  }

  async getIncomeReport(
    clinicId: string,
    filters: {
      from?: string;
      to?: string;
    },
  ) {
    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .innerJoinAndSelect('payment.invoice', 'invoice')
      .leftJoinAndSelect('payment.patient', 'patient')
      .where('invoice.clinicId = :clinicId', { clinicId })
      .andWhere('payment.voidedAt IS NULL');

    if (filters.from) {
      query.andWhere('payment.paidAt >= :from', { from: filters.from });
    }

    if (filters.to) {
      query.andWhere('payment.paidAt <= :to', { to: filters.to });
    }

    const payments = await query.orderBy('payment.paidAt', 'DESC').getMany();
    const total = payments.reduce(
      (acc, payment) => acc + Number(payment.amount),
      0,
    );

    return {
      total: total.toFixed(2),
      count: payments.length,
      payments,
    };
  }

  async getPendingPaymentsReport(clinicId: string) {
    const invoices = await this.invoiceRepository.find({
      where: { clinicId },
      relations: ['patient', 'payments', 'items'],
      order: { issuedAt: 'DESC' },
    });

    const pending = invoices
      .map((invoice) => {
        const paidAmount =
          invoice.payments?.reduce(
            (acc, payment) =>
              acc + (payment.voidedAt ? 0 : Number(payment.amount)),
            0,
          ) ?? 0;
        const totalAmount = Number(invoice.totalAmount);
        const pendingAmount = totalAmount - paidAmount;

        return {
          invoice,
          totalAmount: totalAmount.toFixed(2),
          paidAmount: paidAmount.toFixed(2),
          pendingAmount: pendingAmount.toFixed(2),
        };
      })
      .filter(
        (item) =>
          Number(item.pendingAmount) > 0 &&
          ![
            InvoiceStatus.CANCELLED,
            InvoiceStatus.REJECTED,
            InvoiceStatus.DRAFT,
          ].includes(item.invoice.status),
      );

    const totalPending = pending.reduce(
      (acc, item) => acc + Number(item.pendingAmount),
      0,
    );

    return {
      totalPending: totalPending.toFixed(2),
      count: pending.length,
      invoices: pending,
    };
  }

  async getActiveTreatmentsReport(clinicId: string) {
    const treatments = await this.treatmentRepository
      .createQueryBuilder('treatment')
      .innerJoinAndSelect('treatment.patient', 'patient')
      .where('patient.clinicId = :clinicId', { clinicId })
      .andWhere('treatment.isActive = true')
      .andWhere('treatment.status IN (:...statuses)', {
        statuses: [
          TreatmentStatus.PROPOSED,
          TreatmentStatus.ACCEPTED,
          TreatmentStatus.IN_PROGRESS,
        ],
      })
      .orderBy('treatment.createdAt', 'DESC')
      .getMany();

    return {
      count: treatments.length,
      treatments,
    };
  }
}
