import dotenv from 'dotenv';

dotenv.config();

export const validateEnv = () => {
  const hasDbUrl = Boolean(process.env.DB_URL || process.env.DATABASE_URL);
  const requiredDbParts = [
    'DB_HOST',
    'DB_PORT',
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_DATABASE',
  ];
  const hasDbParts = requiredDbParts.every((envVar) => process.env[envVar]);

  const missingVars = [];

  if (!hasDbUrl && !hasDbParts) {
    missingVars.push('DB_URL or DB_HOST/DB_PORT/DB_USERNAME/DB_PASSWORD/DB_DATABASE');
  }

  if (!process.env.JWT_SECRET) {
    missingVars.push('JWT_SECRET');
  }

  if (missingVars.length > 0) {
    console.error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
    process.exit(1);
  }
};
