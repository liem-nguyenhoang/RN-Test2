import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column('text') // 👈 khai báo rõ type (text)
  name!: string;

  @Column('text')
  email!: string;
}
