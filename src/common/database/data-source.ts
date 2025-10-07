import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Todo } from '../../features/todo/entities/Todo';
import { Project } from '../../features/project/entities/Project';
import { AutoMigration1759878781452 } from '../../features/_shared/migrations/1759878781452-AutoMigration';

export const AppDataSource = new DataSource({
  type: 'react-native',
  database: 'app.db',
  location: 'default',
  logging: true,
  synchronize: true, // luôn false để dùng migration
  entities: [User, Todo, Project],
  migrations: [AutoMigration1759878781452],
});
