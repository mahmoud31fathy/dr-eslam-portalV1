const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use Anon Key to simulate browser client!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  // Login as superadmin to simulate the doctor's client
  await supabase.auth.signInWithPassword({
    email: 'mahmoud@admin.com',
    password: '19071907'
  });

  // Fetch a session ID to test with
  const { data: sessionData } = await supabase.from('sessions').select('id').limit(1).single();
  const sessionId = sessionData.id;

  const { data, error } = await supabase
    .from('attendance_records')
    .select('*, profiles(id, full_name, level, major)')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(50);

  console.log("Error:", error);
  console.log("Data:", JSON.stringify(data, null, 2));
}

main();
