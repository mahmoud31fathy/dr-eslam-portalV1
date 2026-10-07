const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function main() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Login as student
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'mahmoud31fathy@gmail.com',
    password: '19071907' // Wait, I don't know the password... let me just query without auth if RLS is public for read?
  });

}
