import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../auth/entities/user.entity';

export enum SupportRequestStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

@Entity('support_requests')
export class SupportRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('text')
  subject: string;

  @Column('text')
  message: string;

  @Column('text', { nullable: true })
  contactEmail: string;

  @Column('enum', {
    enum: SupportRequestStatus,
    default: SupportRequestStatus.OPEN,
  })
  status: SupportRequestStatus;

  @CreateDateColumn()
  createdAt: Date;
}
