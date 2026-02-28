import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Patient } from '../../patients/entities/patient.entity';
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

  // TODO: Change this to the relationship with the  doctor
  @Column('text')
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
  //
  // @Column({ nullable: true })
  // reason: string;
  //
  // @OneToMany(() => Reminder, (reminder) => reminder.appointment)
  // reminders: Reminder[];
  //
  // @CreateDateColumn()
  // createdAt: Date;
}
