import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const SUPABASE_URL = env.match(/VITE_SUPABASE_URL=(.*)/)[1];
const SUPABASE_KEY = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];

async function run() {
  const sessionId = "0061fd49-bf11-4a3e-a5ae-0a53f2c12742";
  const now = new Date().toISOString();
  
  const res = await fetch(`${SUPABASE_URL}/rest/v1/earn_sessions`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates, return=minimal'
    },
    body: JSON.stringify({
      id: sessionId,
      end_time: now,
      video_title: 'TEST_TITLE',
      devotee_email: 'mallikarjunpm7898@gmail.com',
      video_id: 'live_stream'
    })
  });
  
  console.log(res.status, await res.text());
}

run();
