import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../../common/entities/User.ts';

@Entity('todos')
export class Todo {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column('text')
  title!: string;

  @Column({ default: false, type: 'boolean' })
  completed!: boolean;

  @ManyToOne(() => User)
  user!: User;
}
