import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const SUPABASE_URL = env.match(/VITE_SUPABASE_URL=(.*)/)[1];
const SUPABASE_KEY = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];

async function run() {
  const sessionId = "58444cdc-d361-4915-a224-ea69e43465e5"; // existing session
  const now = new Date().toISOString();
  console.log('Updating with now:', now);

  const res = await fetch(`${SUPABASE_URL}/rest/v1/earn_sessions`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates, return=representation'
    },
    body: JSON.stringify({
      id: sessionId,
      devotee_email: 'shrutigusain24@gmail.com',
      video_id: 'live_stream',
      end_time: now
    })
  });

  const text = await res.text();
  console.log(res.status, text);
}

run();
