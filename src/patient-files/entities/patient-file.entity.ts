import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Patient } from '../../patients/entities/patient.entity';
import { Treatment } from '../../treatments/entities/treatment.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { ClinicalNote } from '../../clinical-notes/entities/clinical-note.entity';
import { ClinicMembership } from '../../clinic-memberships/entities/clinic-membership.entity';
import { PatientFileType } from '../interfaces/patient-file-type.enum';

@Entity('patient_files')
export class PatientFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column('uuid')
  patientId: string;

  @ManyToOne(() => Appointment, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment | null;

  @Column('uuid', { nullable: true })
  appointmentId: string | null;

  @ManyToOne(() => ClinicalNote, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'clinicalNoteId' })
  clinicalNote: ClinicalNote | null;

  @Column('uuid', { nullable: true })
  clinicalNoteId: string | null;

  @ManyToOne(() => Treatment, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'treatmentId' })
  treatment: Treatment | null;

  @Column('uuid', { nullable: true })
  treatmentId: string | null;

  @ManyToOne(() => ClinicMembership, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'uploadedByMembershipId' })
  uploadedByMembership: ClinicMembership | null;

  @Column('uuid', { nullable: true })
  uploadedByMembershipId: string | null;

  @Column({
    type: 'enum',
    enum: PatientFileType,
    default: PatientFileType.OTHER,
  })
  type: PatientFileType;

  @Column('text')
  originalName: string;

  @Column('text')
  storedName: string;

  @Column('text')
  path: string;

  @Column('text')
  url: string;

  @Column('text')
  mimeType: string;

  @Column('int')
  size: number;

  @Column('text', { nullable: true })
  description: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
