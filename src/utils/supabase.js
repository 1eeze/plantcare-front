import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://knupbxftazopklvjionb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtudXBieGZ0YXpvcGtsdmppb25iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1ODgxNjksImV4cCI6MjA3MzE2NDE2OX0.GA9jA2z4X9GbxW9UFgzhKxEKKQjJ7Erv_F41tGm8Em0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)