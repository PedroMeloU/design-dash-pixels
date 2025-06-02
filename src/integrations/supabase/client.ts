
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pffezepqmjogeyfksxgs.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmZmV6ZXBtanFvZ2V5ZmtzeGdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4ODk5NTEsImV4cCI6MjA2NDQ2NTk1MX0.qzjsbMj7daT4bcXSYUoAuAzNKOVFbDreOKTIz4e2_kI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
