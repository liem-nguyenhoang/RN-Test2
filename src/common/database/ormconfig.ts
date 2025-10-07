import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Todo } from '../../features/todo/entities/Todo';
import { Project } from '../../features/project/entities/Project';

const MigrationDataSource = new DataSource({
  type: 'sqlite',
  database: 'migration.db',
  synchronize: false,
  logging: true,
  entities: ['src/common/entities/**/*.ts', 'src/features/**/entities/**/*.ts'],
  migrations: [
    'src/common/migrations/**/*.ts',
    'src/features/**/migrations/**/*.ts',
  ],
});

export default MigrationDataSource;
