<template>
  <div class="community-feed">
    <!-- 상단 헤더 (알림 + 글쓰기 버튼) -->
    <div class="feed-header">
      <button class="icon-btn" @click="goToNotifications">
        <img src="../../assets/icons/heart.png" alt="알람" class="notification-icon" />
      </button>
      <button class="write-btn" @click="goToWrite">+</button>
    </div>

    <!-- 스토리 바 -->
    <div class="story-bar">
      <div v-for="story in stories" :key="story.id" class="story-item">
        <img :src="story.image" class="story-img" />
        <p class="story-name">{{ story.name }}</p>
      </div>
    </div>

    <!-- 피드 리스트 -->
    <div v-for="post in posts" :key="post.id" class="post-card">
      <div class="post-header">
        <div class="profile" :style="{ backgroundImage: `url(${post.profile})` }"></div>
        <span class="profile-name">{{ post.name }}</span>
      </div>
      <div class="post-body" :style="{ backgroundImage: `url(${post.image})` }"></div>
      <div class="post-content">
        <p>{{ post.likes }} Likes</p>
        <p><strong>{{ post.name }}</strong> {{ post.text }}</p>
        <p class="date">{{ post.date }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    goToNotifications() {
      this.$router.push('/notifications')
    },
    goToWrite() {
      this.$router.push('/write')
    }
  },

  name: 'CommunityFeed',
  data() {
    return {
      stories: [
        { id: 1, name: 'you', image: 'https://picsum.photos/50?random=1' },
        { id: 2, name: 'planty', image: 'https://picsum.photos/50?random=2' },
        { id: 3, name: 'green', image: 'https://picsum.photos/50?random=3' },
        // ...
      ],
      posts: [
        {
          id: 1,
          profile: 'https://picsum.photos/100?random=10',
          name: 'PlantLover',
          image: 'https://picsum.photos/600?random=10',
          text: '오늘 몬스테라 너무 예뻐요 🌿',
          date: 'Sep 1',
          likes: 43
        },
        {
          id: 2,
          profile: 'https://picsum.photos/100?random=11',
          name: 'SunshineGreen',
          image: 'https://picsum.photos/600?random=11',
          text: '햇빛 받은 알로카시아 ☀️',
          date: 'Sep 2',
          likes: 77
        }
      ]
    };
  }
}
</script>

<style scoped>
.community-feed {
  background-color: #f7f6ed;
  padding-bottom: 80px;
}

.feed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px 4px;
}

.icon-btn {
  font-size: 20px;
  background: none;
  border: none;
  cursor: pointer;
}

.notification-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.write-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #568265; /* 초록색 */
  color: white;
  font-size: 24px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  transition: background-color 0.2s ease;
}

.write-btn:hover {
  background-color: #456b4f;
}

.story-bar {
  display: flex;
  overflow-x: auto;
  padding: 12px 10px;
  gap: 12px;
}

.story-item {
  flex: 0 0 auto;
  text-align: center;
}

.story-img {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid #8eb88c;
}

.story-name {
  font-size: 12px;
  margin-top: 6px;
  color: #555;
}

.post-card {
  background: white;
  border-radius: 16px;
  margin: 12px 16px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  overflow: hidden;
}

.post-header {
  display: flex;
  align-items: center;
  padding: 10px;
}

.profile {
  background-size: cover;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 10px;
}

.profile-name {
  font-size: 14px;
  font-weight: bold;
}

.post-body {
  height: 300px;
  background-size: cover;
  background-position: center;
}

.post-content {
  padding: 12px 16px;
  font-size: 14px;
  color: #333;
}

.date {
  font-size: 11px;
  color: grey;
  margin-top: 6px;
}
</style>
