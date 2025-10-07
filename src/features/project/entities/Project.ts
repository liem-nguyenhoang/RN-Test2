import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../../common/entities/User.ts';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'text' })
  name!: string;

  @ManyToOne(() => User)
  owner!: User;
}
