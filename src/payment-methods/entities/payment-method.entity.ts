import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../auth/entities/user.entity';

export enum PaymentMethodType {
  CARD = 'card',
  BANK_ACCOUNT = 'bank_account',
  PAYPAL = 'paypal',
  OTHER = 'other',
}

@Entity('payment_methods')
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('enum', {
    enum: PaymentMethodType,
    default: PaymentMethodType.CARD,
  })
  type: PaymentMethodType;

  @Column('text')
  label: string;

  @Column('text', { nullable: true })
  last4: string;

  @Column('int', { nullable: true })
  expiryMonth: number;

  @Column('int', { nullable: true })
  expiryYear: number;

  @Column('bool', { default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
