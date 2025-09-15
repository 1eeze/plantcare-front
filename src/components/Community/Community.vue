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
    <p class="date">{{ post.date }}</p>

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
  </div>

  <!-- 댓글 모달 -->
  <Comment
    :visible="showComment"
    :postId="selectedPostId"
    @close="showComment = false"
  />
</template>

<script>
import filledHeart from '../../assets/icons/filled-heart.png'
import emptyHeart from '../../assets/icons/empty-heart.png'
import Comment from './Comment.vue'

export default {
  name: 'CommunityFeed',

  components: {
    Comment
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
          date: 'Sep 1',
          price: 30000,
          likes: 43,
          liked: false,
          comments: 8
        },
        {
          id: 2,
          profile: 'https://picsum.photos/100?random=11',
          name: 'SunshineGreen',
          image: 'https://picsum.photos/600?random=11',
          title: '알로카시아',
          text: '잎맥이 선명해서 인테리어에 좋습니다.',
          date: 'Sep 2',
          price: 50000,
          likes: 77,
          liked: false,
          comments: 5
        }
      ],
      selectedPostId: null,
      showComment: false
    };
  },

  watch: {
    showComment(val) {
      this.$emit('comment-visibility', val);
    }
  },

  methods: {
    toggleLike(post) {
      post.liked = !post.liked;
      post.likes += post.liked ? 1 : -1;
    },
    goToComments(postId) {
      this.selectedPostId = postId;
      this.showComment = true;
    },
    formatPrice(value) {
      return new Intl.NumberFormat('ko-KR').format(value) + '원'
    } 
}
}
</script>

<style scoped>
.post-card {
  background: white;
  border-radius: 16px;
  margin: 12px 16px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  overflow: hidden;
  text-align: left; /* 기본 왼쪽 정렬 */
  margin:24px 16px;
}

/* 상품 이미지 */
.post-body {
  height: 300px;
  background-size: cover;
  background-position: center;
}

/* 상품명 + 가격 바 */
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
  text-align: left; /* 왼쪽 정렬 고정 */
}

.post-price {
  font-size: 16px;
  font-weight: bold;
  color: #568265; /* 초록 포인트 */
  text-align: right; /* 가격만 오른쪽 */
}

/* 날짜 */
.date {
  font-size: 12px;
  color: grey;
  margin: 4px 16px;
  text-align: left;
}

/* 본문 */
.post-content {
  padding: 0 16px 8px;
  font-size: 14px;
  color: #333;
  text-align: left;
}

/* 프로필 + 좋아요 + 댓글 */
.post-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px 12px;
  border-top: 1px solid #eee;
}

.profile {
  background-size: cover;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 8px;
}

.profile-info {
  display: flex;
  align-items: center; 
  gap: 8px;            
}

.profile-name {
  font-size: 14px;
  font-weight: bold;
}

/* 액션 아이콘 */
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

</style>
