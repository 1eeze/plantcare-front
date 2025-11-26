// 개발용 알림 테스트 유틸리티
// 브라우저 콘솔에서 사용하세요: window.testNotification()

import { supabase } from './supabase'

// 테스트 알림 생성
export async function createTestNotification(type = 'social') {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('❌ 로그인이 필요합니다')
      return
    }

    const notifications = {
      social: {
        title: '새로운 좋아요',
        message: '테스트 사용자님이 회원님의 게시글을 좋아합니다',
        metadata: { post_title: '테스트 게시글' }
      },
      comment: {
        title: '새로운 댓글',
        message: '테스트 사용자님이 회원님의 게시글에 댓글을 달았습니다',
        metadata: { comment_content: '정말 멋진 식물이네요!' }
      },
      reply: {
        title: '새로운 답글',
        message: '테스트 사용자님이 회원님의 댓글에 답글을 달았습니다',
        metadata: { comment_content: '저도 동감합니다!' }
      },
      plant: {
        title: '물주기 시간',
        message: '몬스테라에 물을 줄 시간입니다',
        metadata: { plantName: '몬스테라' }
      },
      trade: {
        title: '구매 요청',
        message: '테스트 사용자님이 "몬스테라 분양" 구매를 요청했습니다',
        metadata: { price: 25000, plantName: '몬스테라 분양' }
      }
    }

    const notificationData = notifications[type] || notifications.social

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        type: type === 'comment' || type === 'reply' ? 'social' : (type === 'trade' ? 'trade' : type),
        title: notificationData.title,
        message: notificationData.message,
        read: false,
        metadata: notificationData.metadata
      })
      .select()

    if (error) throw error

    console.log('✅ 테스트 알림이 생성되었습니다:', data)
    return data
  } catch (e) {
    console.error('❌ 알림 생성 실패:', e)
  }
}

// 여러 개의 테스트 알림 생성
export async function createMultipleTestNotifications(count = 5) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('❌ 로그인이 필요합니다')
      return
    }

    const types = ['social', 'comment', 'reply', 'plant']
    const names = ['김식물', '이정원', '박다육', '최선인장', '정허브']

    const notifications = []
    for (let i = 0; i < count; i++) {
      const type = types[i % types.length]
      const name = names[i % names.length]

      notifications.push({
        user_id: user.id,
        type: type === 'comment' || type === 'reply' ? 'social' : type,
        title: type === 'plant' ? '물주기 알림' : `새로운 ${type === 'reply' ? '답글' : '좋아요'}`,
        message: type === 'plant'
          ? '식물에 물을 줄 시간입니다'
          : `${name}님이 회원님의 게시글에 ${type === 'reply' ? '답글을' : '좋아요를'} 보냈습니다`,
        read: i >= count - 2, // 마지막 2개는 읽은 상태로
        metadata: { test: true }
      })
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select()

    if (error) throw error

    console.log(`✅ ${count}개의 테스트 알림이 생성되었습니다`)
    return data
  } catch (e) {
    console.error('❌ 알림 생성 실패:', e)
  }
}

// 모든 테스트 알림 삭제
export async function clearTestNotifications() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('❌ 로그인이 필요합니다')
      return
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id)

    if (error) throw error

    console.log('✅ 모든 알림이 삭제되었습니다')
  } catch (e) {
    console.error('❌ 알림 삭제 실패:', e)
  }
}

// 내 알림 목록 조회
export async function getMyNotifications() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('❌ 로그인이 필요합니다')
      return
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    console.log('📬 내 알림 목록:')
    console.table(data.map(n => ({
      ID: n.id,
      타입: n.type,
      제목: n.title,
      읽음: n.read ? '✅' : '❌',
      생성시간: new Date(n.created_at).toLocaleString('ko-KR')
    })))

    return data
  } catch (e) {
    console.error('❌ 알림 조회 실패:', e)
  }
}

// 브라우저 전역에 노출
if (typeof window !== 'undefined') {
  window.testNotification = createTestNotification
  window.createMultipleTestNotifications = createMultipleTestNotifications
  window.clearTestNotifications = clearTestNotifications
  window.getMyNotifications = getMyNotifications

  console.log(`
🧪 알림 테스트 유틸리티가 로드되었습니다!

사용 가능한 명령어:
- testNotification('social')    → 좋아요 알림 생성
- testNotification('comment')   → 댓글 알림 생성
- testNotification('reply')     → 답글 알림 생성
- testNotification('plant')     → 식물 알림 생성
- createMultipleTestNotifications(5) → 5개의 랜덤 알림 생성
- getMyNotifications()          → 내 알림 목록 조회
- clearTestNotifications()      → 모든 알림 삭제
  `)
}
