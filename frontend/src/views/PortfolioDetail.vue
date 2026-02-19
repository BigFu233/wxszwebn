<template>
  <div class="portfolio-detail-container animate__animated animate__fadeIn">
    <div class="back-link" @click="$router.back()">
      <el-icon><ArrowLeft /></el-icon> 返回列表
    </div>

    <div class="content-wrapper" v-if="portfolio">
      <div class="media-section">
        <img
          :src="resolveImageUrl(portfolio.url)"
          class="main-image"
          v-if="portfolio.type === 'photo' || portfolio.type === 'post_prod'"
        />
        <video controls class="main-video" v-else-if="portfolio.type === 'video'">
          <source :src="resolveImageUrl(portfolio.url)" type="video/mp4">
          您的浏览器不支持 Video 标签。
        </video>
      </div>

      <div class="info-section">
        <h1 class="title">{{ portfolio.title }}</h1>
        
        <div class="author-info">
          <el-avatar
            :size="40"
            :src="portfolio.user?.avatarUrl || `https://i.pravatar.cc/150?u=${portfolio.user?.username}`"
          />
          <div class="author-meta">
            <span class="username">{{ portfolio.user?.username || '未知作者' }}</span>
            <span class="date">{{ formatDate(portfolio.createdAt) }}</span>
          </div>
        </div>

        <div class="description" v-if="portfolio.description">
          <p>{{ portfolio.description }}</p>
        </div>

        <div class="interactions">
          <el-button type="primary" circle :icon="Star" :plain="!isLiked" @click="toggleLike" />
          <span class="count">{{ likeCount }}</span>
          
          <el-button circle :icon="Share" @click="handleShare" />
          <span class="count">分享</span>
        </div>

        <el-divider />

        <div class="comments-section">
          <h3>评论 ({{ comments.length }})</h3>
          <div class="comment-input">
            <el-input
              v-model="newComment"
              placeholder="写下你的想法..."
              :rows="2"
              type="textarea"
            />
            <el-button type="primary" size="small" class="send-btn" @click="submitComment">发送</el-button>
          </div>
          
          <div class="comment-list">
            <div v-for="comment in comments" :key="comment.id" class="comment-item">
              <el-avatar :size="32" :src="comment.user.avatar" />
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-user">{{ comment.user.username }}</span>
                  <span class="comment-time">{{ comment.date }}</span>
                </div>
                <p class="comment-text">{{ comment.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowLeft, Star, Share } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import request from '../utils/request';

const route = useRoute();
const id = route.params.id as string;

const portfolio = ref<any | null>(null);

const isLiked = ref(false);
const likeCount = ref(0);
const newComment = ref('');
const comments = ref([
  {
    id: 1,
    user: { username: '用户A', avatar: 'https://i.pravatar.cc/150?u=a' },
    content: '太美了！光影控制得非常好。',
    date: '2小时前'
  },
  {
    id: 2,
    user: { username: '用户B', avatar: 'https://i.pravatar.cc/150?u=b' },
    content: '请问这是在哪里拍的？',
    date: '5小时前'
  }
]);

const toggleLike = () => {
  isLiked.value = !isLiked.value;
  likeCount.value += isLiked.value ? 1 : -1;
};

const handleShare = () => {
  ElMessage.success('链接已复制到剪贴板');
};

const submitComment = () => {
  if (!newComment.value.trim()) return;
  
  comments.value.unshift({
    id: Date.now(),
    user: { username: '我', avatar: 'https://i.pravatar.cc/150?u=me' },
    content: newComment.value,
    date: '刚刚'
  });
  
  newComment.value = '';
  ElMessage.success('评论已发布');
};

const formatDate = (value: string | Date) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString();
};

const resolveImageUrl = (url: string) => {
  if (!url) return '';
  const uploadsIndex = url.indexOf('/uploads/');
  if (uploadsIndex !== -1) {
    const path = url.substring(uploadsIndex);
    const isNetlify = window.location.hostname.endsWith('netlify.app');
    return isNetlify ? `/.netlify/functions/proxy${path}` : `http://112.124.10.28${path}`;
  }
  return url;
};

const fetchPortfolio = async () => {
  try {
    const res = await request.get(`/portfolios/${id}`);
    portfolio.value = res as any;
  } catch (error) {
    ElMessage.error('获取作品详情失败');
  }
};

onMounted(() => {
  fetchPortfolio();
});
</script>

<style scoped>
.portfolio-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  color: #606266;
  margin-bottom: 20px;
  font-size: 1rem;
  transition: color 0.3s;
}

.back-link:hover {
  color: var(--primary-color);
}

.content-wrapper {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
}

@media (max-width: 992px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }
}

.media-section {
  background-color: #f5f7fa;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.main-image, .main-video {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
}

.info-section {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  height: fit-content;
}

.title {
  font-size: 2rem;
  margin: 0 0 20px 0;
  color: #333;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
}

.author-meta {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 600;
  color: #333;
}

.date {
  font-size: 0.85rem;
  color: #999;
}

.description {
  color: #666;
  line-height: 1.8;
  margin-bottom: 25px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
}

.interactions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.count {
  font-size: 0.9rem;
  color: #666;
  margin-right: 10px;
}

.comment-input {
  margin-bottom: 30px;
}

.send-btn {
  margin-top: 10px;
  float: right;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  display: flex;
  gap: 15px;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.comment-user {
  font-weight: 600;
  font-size: 0.95rem;
}

.comment-time {
  font-size: 0.8rem;
  color: #999;
}

.comment-text {
  color: #666;
  font-size: 0.95rem;
  margin: 0;
  line-height: 1.5;
}
</style>
