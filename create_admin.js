const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const email = 'mahmoud@admin.com';
  
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  const user = users.users.find(u => u.email === email);
  let userId;
  
  if (user) {
      console.log('User already exists in Auth table:', user.id);
      userId = user.id;
  } else {
      console.log('User not found. You need to create it!');
      return;
  }

  console.log('Updating profile role to superadmin...');
  const { data: updateData, error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'superadmin' })
    .eq('id', userId);

  if (updateError) {
    console.error('Error updating profile role:', updateError);
  } else {
    console.log('Success! Account is now a superadmin.');
  }
}

main();
