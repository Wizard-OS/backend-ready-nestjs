import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TreatmentSession } from '../../treatment-sessions/entities/treatment-session.entity';

@Entity('treatments')
export class Treatment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @Column('uuid')
  patientId: string;

  @Column('uuid')
  doctorId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('int')
  basePrice: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => TreatmentSession, (session) => session.treatment)
  sessions: TreatmentSession[];
}
