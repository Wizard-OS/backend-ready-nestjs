import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../auth/entities/user.entity';
import { Patient } from '../../patients/entities/patient.entity';
import { Reminder } from '../../reminders/entities/reminder.entity';
import { AppointmentStatus } from '../interfaces/AppointmentStatus.enum';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('timestamp')
  date: Date;

  @ManyToOne(() => Patient, (patient) => patient.appointments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column('uuid')
  patientId: string;

  @ManyToOne(() => User, (user) => user.appointments, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'dentistId' })
  dentist: User;

  @Column({ nullable: true })
  dentistId: string;

  @Column('text', {
    unique: true,
  })
  email: string;

  @Column('boolean', {
    default: false,
  })
  completed: boolean;

  @Column('text')
  description: string;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
  })
  status: AppointmentStatus;

  @Column({ nullable: true })
  reason: string;

  @OneToMany(() => Reminder, (reminder) => reminder.appointment)
  reminders: Reminder[];

  @CreateDateColumn()
  createdAt: Date;
}
