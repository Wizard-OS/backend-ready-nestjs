import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Invoice } from '../../invoices/entities/invoice.entity';
import { Patient } from '../../patients/entities/patient.entity';
import { Treatment } from '../../treatments/entities/treatment.entity';
import { PaymentMethod } from '../interfaces/payment-method.enum';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.payments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;

  @Column()
  invoiceId: string;

  @ManyToOne(() => Patient, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'patientId' })
  patient: Patient | null;

  @Column('uuid', { nullable: true })
  patientId: string | null;

  @ManyToOne(() => Treatment, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'treatmentId' })
  treatment: Treatment | null;

  @Column('uuid', { nullable: true })
  treatmentId: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: string;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
  })
  method: PaymentMethod;

  @Column({ type: 'text', nullable: true })
  reference: string | null;

  @Column('uuid', { nullable: true })
  receivedByMembershipId: string | null;

  @Column({ type: 'timestamp' })
  paidAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  voidedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  voidReason: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
