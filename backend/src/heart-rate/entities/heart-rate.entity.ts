import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('heart_rates')
export class HeartRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  @Index()
  timestamp: Date;

  @Column('int')
  heartRate: number;

  @CreateDateColumn()
  createdAt: Date;
}
