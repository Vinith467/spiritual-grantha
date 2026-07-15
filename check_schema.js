import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf-8');
const SUPABASE_URL = env.match(/VITE_SUPABASE_URL=(.*)/)[1];
const SUPABASE_KEY = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkSchema() {
  const { data, error } = await supabase.rpc('get_schema');
  console.log(data, error);
}
checkSchema();
