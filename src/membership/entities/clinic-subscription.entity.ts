import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Clinic } from '../../clinics/entities/clinic.entity';
import { ClinicMembership } from '../../clinic-memberships/entities/clinic-membership.entity';
import { MembershipPlanCode } from '../interfaces/membership-plan-code.enum';
import { SubscriptionStatus } from '../interfaces/subscription-status.enum';

@Entity('clinic_subscriptions')
@Index(['clinicId'], { unique: true })
export class ClinicSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Clinic, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic;

  @Column('uuid')
  clinicId: string;

  @Column('enum', {
    enum: MembershipPlanCode,
    enumName: 'clinic_subscriptions_plancode_enum',
    default: MembershipPlanCode.free,
  })
  planCode: MembershipPlanCode;

  @Column('text', { default: '2026-08-mvp' })
  planVersion: string;

  @Column('enum', {
    enum: SubscriptionStatus,
    enumName: 'clinic_subscriptions_status_enum',
    default: SubscriptionStatus.active,
  })
  status: SubscriptionStatus;

  @Column('timestamptz', { default: () => 'now()' })
  startedAt: Date;

  @Column('timestamptz', { nullable: true })
  currentPeriodStart: Date | null;

  @Column('timestamptz', { nullable: true })
  currentPeriodEnd: Date | null;

  @ManyToOne(() => ClinicMembership, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assignedByMembershipId' })
  assignedByMembership: ClinicMembership | null;

  @Column('uuid', { nullable: true })
  assignedByMembershipId: string | null;

  @Column('text', { nullable: true })
  changeReason: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
