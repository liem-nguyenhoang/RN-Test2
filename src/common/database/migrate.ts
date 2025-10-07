import { AppDataSource } from './data-source';

export const runMigrations = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  await AppDataSource.runMigrations();
  console.log('✅ All migrations applied successfully');
};
