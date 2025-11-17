// supabase/functions/withdraw-user/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// 1. _shared/cors.ts의 내용을 여기에 직접 추가합니다.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // OPTIONS 요청(preflight) 처리 (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. 요청 보낸 사용자의 ID 가져오기
    const authHeader = req.headers.get('Authorization')!
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) throw new Error('사용자 인증 실패')

    // 3. 관리자 권한(service_role)으로 Supabase 클라이언트 생성
    //    (이전에 'Secrets'에 등록한 키를 사용합니다)
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('ADMIN_SERVICE_ROLE_KEY') ?? ''
    )

    // 4. public.Users에서 프로필 삭제 (1단계에서 설정한 CASCADE 작동!)
    //    (스키마의 "Users" 테이블 이름과 일치시킴)
    const { error: profileError } = await adminClient
      .from('Users') 
      .delete()
      .eq('id', user.id)

    if (profileError) {
      console.error('Profile delete error:', profileError.message);
      throw new Error(`프로필 삭제 실패: ${profileError.message}`)
    }

    // 5. auth.users에서 인증 계정 삭제 (1단계에서 설정한 messages CASCADE 작동!)
    const { error: authError } = await adminClient.auth.admin
      .deleteUser(user.id)

    if (authError) {
      console.error('Auth user delete error:', authError.message);
      throw new Error(`인증 계정 삭제 실패: ${authError.message}`)
    }

    // 6. 성공 응답 반환
    return new Response(JSON.stringify({ message: '회원 탈퇴 성공' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    // 7. 실패 응답 반환
    console.error('Full error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})