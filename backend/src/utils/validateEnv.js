import dotenv from 'dotenv';

dotenv.config();

export const validateEnv = () => {
  const missingVars = [];

  if (!process.env.SUPABASE_URL) {
    missingVars.push('SUPABASE_URL');
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    missingVars.push('SUPABASE_SERVICE_ROLE_KEY');
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
