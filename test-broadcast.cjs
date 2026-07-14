const fetch = require('node-fetch');

const SUPABASE_URL = 'https://obweikuiqjeymihrbodv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9id2Vpa3VpcWpleW1paHJib2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NzI2OTEsImV4cCI6MjA5MzQ0ODY5MX0.VqDnMByHC4clMcaQUskdOH3KLRJaJqytRLUAQzJUxvg';

async function testBroadcast(topic) {
  console.log('Testing topic:', topic);
  const response = await fetch(`${SUPABASE_URL}/realtime/v1/api/broadcast`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [
        {
          topic: topic,
          event: 'frame',
          payload: {
            frame: 'test_frame',
            email: 'test@example.com',
            session_id: 'test_session_123'
          }
        }
      ]
    })
  });
  const text = await response.text();
  console.log(`Response for ${topic}:`, response.status, text);
}

async function run() {
  await testBroadcast('realtime:live-screencasts');
  await testBroadcast('live-screencasts');
}
run();
