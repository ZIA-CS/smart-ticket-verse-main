import { AppDataSource } from '../config/data-source.js';

const runSeed = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    // TODO: Add seed data logic
    console.log('Seed data inserted successfully');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

runSeed();
