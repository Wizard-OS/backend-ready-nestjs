import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Patient } from '../../patients/entities/patient.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { InvoiceStatus } from '../InvoiceStatus/InvoiceStatus.enum';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient, (patient) => patient.invoices)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column()
  patientId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount: string;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
  })
  status: InvoiceStatus;

  @OneToMany(() => Payment, (payment) => payment.invoice)
  payments: Payment[];

  @CreateDateColumn()
  issuedAt: Date;
}
