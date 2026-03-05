import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../auth/entities/user.entity';
import { ClinicalRecord } from '../../clinical-records/entities/clinical-record.entity';
import { ClinicMembership } from '../../clinic-memberships/entities/clinic-membership.entity';

@Entity('clinical_notes')
export class ClinicalNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ClinicalRecord, (record) => record.notes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'clinicalRecordId' })
  clinicalRecord: ClinicalRecord;

  @Column()
  clinicalRecordId: string;

  @ManyToOne(() => User, (user) => user.clinicalNotes)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  authorId: string;

  @ManyToOne(() => ClinicMembership, (membership) => membership.clinicalNotes, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'authorMembershipId' })
  authorMembership: ClinicMembership;

  @Column('uuid', { nullable: true })
  authorMembershipId: string | null;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}
