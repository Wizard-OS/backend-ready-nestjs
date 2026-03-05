import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Patient } from '../../patients/entities/patient.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { ClinicMembership } from '../../clinic-memberships/entities/clinic-membership.entity';
import { AppointmentType } from '../../appointments/entities/appointment-type.entity';

@Entity('clinics')
export class Clinic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @Column('text', { default: 'America/Montevideo' })
  timezone: string;

  @Column('text', { default: 'USD' })
  currency: string;

  @Column('bool', { default: true })
  isActive: boolean;

  @OneToMany(() => ClinicMembership, (membership) => membership.clinic)
  memberships: ClinicMembership[];

  @OneToMany(() => Patient, (patient) => patient.clinic)
  patients: Patient[];

  @OneToMany(() => Appointment, (appointment) => appointment.clinic)
  appointments: Appointment[];

  @OneToMany(() => AppointmentType, (appointmentType) => appointmentType.clinic)
  appointmentTypes: AppointmentType[];

  @OneToMany(() => Invoice, (invoice) => invoice.clinic)
  invoices: Invoice[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
