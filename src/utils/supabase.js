import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://knupbxftazopklvjionb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtudXBieGZ0YXpvcGtsdmppb25iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1ODgxNjksImV4cCI6MjA3MzE2NDE2OX0.GA9jA2z4X9GbxW9UFgzhKxEKKQjJ7Erv_F41tGm8Em0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Supabase Edge Function 호출용 fetch 헬퍼
export async function apiFetch(url, options = {}) {
  // 로그인 후 저장된 access_token이 있으면 사용, 없으면 anon key 사용
  const accessToken = localStorage.getItem('access_token')
  const token = accessToken || supabaseAnonKey

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  }

  const response = await fetch(url, {
    ...options,
    headers
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}