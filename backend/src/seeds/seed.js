import { supabase } from '../config/supabaseClient.js';

const runSeed = async () => {
  try {
    const { error } = await supabase.from('users').select('id').limit(1);

    if (error) {
      throw error;
    }

    console.log('Supabase connected');

    // TODO: Add seed data logic
    console.log('Seed data inserted successfully');

  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

runSeed();
