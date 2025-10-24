<template>
  <div v-for="post in posts" :key="post.id" class="post-card">
    <!-- 상품 이미지 -->
    <div class="post-body" :style="{ backgroundImage: `url(${post.image})` }"></div>

    <!-- 상품명 + 가격 -->
    <div class="post-header-bar">
      <h3 class="post-title">{{ post.title }}</h3>
      <span class="post-price">{{ formatPrice(post.price) }}</span>
    </div>

    <!-- 날짜 -->
    <p class="date">{{ new Date(post.created_at).toLocaleDateString() }}</p>

    <!-- 본문 -->
    <div class="post-content">
      <p>{{ post.text }}</p>
    </div>

    <!-- 프로필 + 좋아요 + 댓글 -->
    <div class="post-footer">
      <div class="profile-info">
        <div class="profile" :style="{ backgroundImage: `url(${post.profile})` }"></div>
        <span class="profile-name">{{ post.name }}</span>
      </div>

      <div class="action-section">
        <!-- 좋아요 -->
        <div class="like-section">
          <img
            :src="post.liked ? filledHeart : emptyHeart"
            @click="toggleLike(post)"
            class="heart-icon"
            alt="좋아요"
          />
          <span>{{ post.likes }}</span>
        </div>

        <!-- 댓글 -->
        <div class="comment-section">
          <img
            src="../../assets/icons/comments.png"
            @click="goToComments(post.id)"
            class="comment-icon"
            alt="댓글"
          />
          <span>{{ post.comments }}</span>
        </div>
      </div>
    </div>

    <!-- 버튼 두 개 나란히 배치 -->
    <div class="buy-btn-wrapper">
      <button class="chat-btn" @click="openChatFor(post)">채팅하기</button>
      <button class="buy-btn">구매하기</button>
    </div>
  </div>

  <!-- 댓글 모달 -->
  <Comment
    :visible="showComment"
    :postId="selectedPostId"
    @close="showComment = false"
  />

  <!-- 채팅 팝업 -->
  <ChatPopup
    v-for="chat in openChats"
    :key="chat.id"
    :visible="chat.visible"
    :title="chat.title"
    :startX="chat.pos.x"
    :startY="chat.pos.y"
    :zIndex="chat.z"
    :receiverId="chat.seller_id"
    @close="closeChat(chat.id)"
  />
</template>

<script>
import filledHeart from '../../assets/icons/filled-heart.png'
import emptyHeart from '../../assets/icons/empty-heart.png'
import Comment from './Comment.vue'
import ChatPopup from '../chat/ChatPopup.vue'
import { supabase } from '../../utils/supabase'

let zSeed = 10000

export default {
  name: 'CommunityFeed',

  components: {
    Comment,
    ChatPopup
  },

  data() {
    return {
      filledHeart,
      emptyHeart,
      posts: [
        {
          id: 1,
          profile: 'https://picsum.photos/100?random=10',
          name: 'PlantLover',
          image: 'https://picsum.photos/600?random=10',
          title: '몬스테라 알보',
          text: '무늬가 예쁩니다',
          created_at: new Date().toISOString(),
          price: 30000,
          likes: 43,
          liked: false,
          comments: 8,
          user_id: 'temp-user-1'
        },
        {
          id: 2,
          profile: 'https://picsum.photos/100?random=11',
          name: 'SunshineGreen',
          image: 'https://picsum.photos/600?random=11',
          title: '알로카시아',
          text: '잎맥이 선명해서 인테리어에 좋습니다.',
          created_at: new Date().toISOString(),
          price: 50000,
          likes: 77,
          liked: false,
          comments: 5,
          user_id: 'temp-user-2'
        }
      ],
      selectedPostId: null,
      showComment: false,
      openChats: []
    }
  },

  methods: {
    toggleLike(post) {
      post.liked = !post.liked
      post.likes += post.liked ? 1 : -1
    },

    goToComments(postId) {
      this.selectedPostId = postId
      this.showComment = true
    },

    formatPrice(value) {
      return new Intl.NumberFormat('ko-KR').format(value) + '원'
    },

    openChatFor(post) {
      const id = `post:${post.id}`
      const title = post.name || '채팅'

      const found = this.openChats.find(c => c.id === id)
      if (found) {
        found.visible = true
        this.focusChat(id)
        return
      }

      const room = {
        id: id,
        title: title,
        visible: true,
        pos: { 
          x: 20 + (this.openChats.length * 30), 
          y: 20 + (this.openChats.length * 30)
        },
        seller_id: post.user_id,
        z: ++zSeed
      }

      this.openChats.push(room)
      this.focusChat(id)
    },

    focusChat(id) {
      const c = this.openChats.find(x => x.id === id)
      if (c) c.z = ++zSeed
    },

    closeChat(id) {
      const idx = this.openChats.findIndex(x => x.id === id)
      if (idx !== -1) {
        this.openChats.splice(idx, 1)
      }
    }
  }
}
</script>

<style scoped>
.post-card {
  background: white;
  border-radius: 16px;
  margin: 24px 16px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  overflow: hidden;
  text-align: left;
}

.post-body {
  height: 300px;
  background-size: cover;
  background-position: center;
}

.post-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px 0;
}

.post-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0;
  text-align: left;
}

.post-price {
  font-size: 16px;
  font-weight: bold;
  color: #568265;
  text-align: right;
}

.date {
  font-size: 12px;
  color: grey;
  margin: 4px 16px;
  text-align: left;
}

.post-content {
  padding: 0 16px 8px;
  font-size: 14px;
  color: #333;
  text-align: left;
}

.post-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px 12px;
  border-top: 1px solid #eee;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile {
  background-size: cover;
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.profile-name {
  font-size: 14px;
  font-weight: bold;
}

.action-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.heart-icon, .comment-icon {
  width: 20px;
  height: 20px;
  cursor: pointer;
  margin-right: 4px;
}

.buy-btn-wrapper {
  display: flex;
  gap: 10px;
  padding: 0 16px 16px;
}

.buy-btn {
  flex: 1;
  background-color: #568265;
  color: white;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  padding: 12px 0;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.buy-btn:hover {
  background-color: #456b4f;
}

.chat-btn {
  flex: 1;
  background-color: white;
  color: #568265;
  font-size: 16px;
  font-weight: bold;
  border: 2px solid #568265;
  border-radius: 8px;
  padding: 12px 0;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.chat-btn:hover {
  background-color: #f0f5f2;
}
</style>