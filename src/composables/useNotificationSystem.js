import { supabase } from '@/utils/supabase'
import { notificationStore } from '@/utils/notificationStore'

let realtimeChannel = null
let debounceTimer = null

export function useNotificationSystem() {
  
  // DB에서 최신 숫자 가져오기
  const fetchInitialCounts = async (userId) => {
    try {
      // 1. 채팅 안 읽은 수
      const { count: chatCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', userId)
        .eq('is_read', false)
      
      notificationStore.setChatCount(chatCount || 0)

      // 2. 알림 안 읽은 수
      const { count: alertCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false)

      notificationStore.setAlertCount(alertCount || 0)
    } catch (e) {
      console.error('알림 카운트 조회 실패:', e)
    }
  }

  // 중복 호출 방지 (0.5초 딜레이)
  const debouncedFetch = (userId) => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      fetchInitialCounts(userId)
    }, 500)
  }

  const initNotifications = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return

    const userId = session.user.id

    // 이미 연결돼있으면 패스
    if (realtimeChannel && realtimeChannel.state === 'joined') return

    // 초기값 로드
    await fetchInitialCounts(userId)

    if (realtimeChannel) await supabase.removeChannel(realtimeChannel)

    realtimeChannel = supabase
      .channel('integrated-notifications')
      // [채팅] 새 메시지 (INSERT) -> 숫자 증가
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${userId}` }, 
        () => notificationStore.incrementChatCount()
      )
      // [채팅] 읽음 처리됨 (UPDATE) -> 숫자 재조회 (줄어듦)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `receiver_id=eq.${userId}` }, 
        () => debouncedFetch(userId)
      )
      // [알림] 새 알림 (INSERT) -> 숫자 증가
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, 
        () => notificationStore.incrementAlertCount()
      )
      // [알림] 읽음 처리됨 (UPDATE) -> 숫자 재조회 (줄어듦)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, 
        () => debouncedFetch(userId)
      )
      .subscribe()
  }

  return { initNotifications }
}