import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ValidRoles } from '../interfaces';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { ClinicalNote } from '../../clinical-notes/entities/clinical-note.entity';

@Entity('users')
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
  })
  email: string;

  @Column('text', {
    select: false,
  })
  password: string;

  @Column('text')
  firstName: string;

  @Column('text')
  lastName: string;

  @Column('bool', {
    default: true,
  })
  isActive: boolean;

  @Column('enum', {
    enum: ValidRoles,
    array: true,
    default: [ValidRoles.odontologist],
  })
  roles: ValidRoles[];

  @OneToMany(() => Appointment, (appointment) => appointment.dentist)
  appointments: Appointment[];

  @OneToMany(() => ClinicalNote, (note) => note.author)
  clinicalNotes: ClinicalNote[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
