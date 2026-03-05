import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Gender } from '../../common/interfaces/gender.enum';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { ClinicalRecord } from '../../clinical-records/entities/clinical-record.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { Clinic } from '../../clinics/entities/clinic.entity';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Clinic, (clinic) => clinic.patients, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic;

  @Column('uuid', { nullable: true })
  clinicId: string | null;

  @Column('text', {
    unique: true,
    nullable: true,
  })
  email: string;

  @Column('text')
  firstName: string;

  @Column('text')
  lastName: string;

  @Column('date')
  birthDate: Date;

  @Column('enum', {
    enum: Gender,
  })
  gender: Gender;

  @Column('text', {
    nullable: true,
  })
  address: string;

  @Column('text', {
    nullable: true,
    unique: true,
  })
  phone: string;

  @OneToMany(() => Appointment, (appointment) => appointment.patient)
  appointments: Appointment[];

  @OneToOne(() => ClinicalRecord, (record) => record.patient, {
    cascade: true,
  })
  clinicalRecord: ClinicalRecord;

  @OneToMany(() => Invoice, (invoice) => invoice.patient)
  invoices: Invoice[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    if (this.email) {
      this.email = this.email.toLowerCase().trim();
    }
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
