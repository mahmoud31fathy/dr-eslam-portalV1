const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const { data: profile } = await supabase.from('profiles').select('*').eq('email', 'mahmoud31fathy@gmail.com').single();
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  
  const { data: recentSessions } = await supabase
    .from('sessions')
    .select('id, class_id, classes(level, major)')
    .gte('created_at', twoHoursAgo)
    .order('created_at', { ascending: false });

  console.log("Recent sessions:", recentSessions);
  
  if (!recentSessions || recentSessions.length === 0) {
    console.log("No recent sessions");
    return;
  }
  const matchingSession = recentSessions.find((session) => {
    const classInfo = session.classes;
    if (!classInfo) return false;
    
    console.log("Checking session:", session.id);
    console.log("Class Level:", classInfo.level, "Type:", typeof classInfo.level);
    console.log("Profile Level:", profile.level, "Type:", typeof profile.level);
    
    const classL = String(classInfo.level).trim();
    const profL = String(profile.level || '').trim();
    console.log("L match:", classL === profL);
    
    const classM = String(classInfo.major).trim().toLowerCase();
    const profM = String(profile.major || '').trim().toLowerCase();
    console.log("M match:", classM === profM);
    
    const levelMatches = !classInfo.level || classL === profL;
    const majorMatches = !classInfo.major || classM === profM;
    
    return levelMatches && majorMatches;
  });

  console.log("Matching session:", matchingSession);
}

main();
