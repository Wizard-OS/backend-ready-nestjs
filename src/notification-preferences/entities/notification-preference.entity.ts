import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../auth/entities/user.entity';

@Entity('notification_preferences')
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { unique: true })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('bool', { default: true })
  emailNotifications: boolean;

  @Column('bool', { default: true })
  smsNotifications: boolean;

  @Column('bool', { default: true })
  pushNotifications: boolean;

  @Column('bool', { default: true })
  appointmentReminders: boolean;

  @Column('bool', { default: false })
  marketingEmails: boolean;

  @Column('bool', { default: true })
  treatmentUpdates: boolean;

  @Column('bool', { default: true })
  billingAlerts: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
