import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../auth/entities/user.entity';

@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('text', { nullable: true })
  deviceName: string;

  @Column('text', { nullable: true })
  ipAddress: string;

  @Column('text', { nullable: true })
  userAgent: string;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  lastActiveAt: Date;

  @Column('bool', { default: false })
  isRevoked: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
