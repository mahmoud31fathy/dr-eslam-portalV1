const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const { data: policies, error } = await supabase
    .rpc('get_policies_for_table', { table_name: 'classes' });
    
  if (error) {
    // If we don't have this RPC, let's just query pg_policies
    const { data: pgPolicies, error: pgError } = await supabase
      .from('pg_policies') // pg_policies is a system catalog, usually not accessible via API, but let's try with service key if we can bypass? Actually REST API doesn't expose pg_catalog.
      .select('*');
  }
  
}

main();
