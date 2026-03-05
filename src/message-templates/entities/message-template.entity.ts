import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Clinic } from '../../clinics/entities/clinic.entity';
import { NotificationChannel } from '../../common/interfaces/notification-channel.enum';
import { MessageTemplateStatus } from '../interfaces/message-template-status.enum';

@Entity('message_templates')
export class MessageTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Clinic, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic;

  @Column('uuid')
  clinicId: string;

  @Column('enum', {
    enum: NotificationChannel,
  })
  channel: NotificationChannel;

  @Column('text')
  name: string;

  @Column('text')
  body: string;

  @Column('enum', {
    enum: MessageTemplateStatus,
    default: MessageTemplateStatus.ACTIVE,
  })
  status: MessageTemplateStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
