
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable. Please connect your project to Supabase using the green Supabase button in the top right corner.')
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable. Please connect your project to Supabase using the green Supabase button in the top right corner.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
