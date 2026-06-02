import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envContent = fs.readFileSync('.env', 'utf-8')
const env = {}
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=')
  if (key) env[key.trim()] = val.join('=').trim()
})

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

async function checkDb() {
  const { data: series } = await supabase.from('series').select('*')
  const { data: episodes } = await supabase.from('episodes').select('*')
  const { data: banners } = await supabase.from('banners').select('*')
  
  console.log("=== SERIES ===")
  console.log(series)
  console.log("=== EPISODES ===")
  console.log(episodes)
  console.log("=== BANNERS ===")
  console.log(banners)
}
checkDb()
