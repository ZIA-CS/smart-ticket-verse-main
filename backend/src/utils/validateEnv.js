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
  const isProduction = process.env.NODE_ENV === 'production';

  const missingVars = [];

  if (isProduction && !hasDbUrl) {
    missingVars.push('DB_URL or DATABASE_URL');
  } else if (!hasDbUrl && !hasDbParts) {
    missingVars.push('DB_URL or DB_HOST/DB_PORT/DB_USERNAME/DB_PASSWORD/DB_DATABASE');
  }

  if (isProduction && hasDbParts) {
    const host = String(process.env.DB_HOST || '').toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
      missingVars.push('DB_URL or DATABASE_URL (localhost is invalid in production)');
    }
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
