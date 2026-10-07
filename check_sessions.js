const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  
  const { data: recentSessions, error } = await supabase
    .from('sessions')
    .select('id, class_id, created_at, classes(level, major)')
    //.gte('created_at', twoHoursAgo)
    .order('created_at', { ascending: false })
    .limit(5);
    
  console.log("Recent sessions:", JSON.stringify(recentSessions, null, 2));
  console.log("Error:", error);
}

main();
