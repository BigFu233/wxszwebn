<template>
  <div class="portfolio-container">
    <div class="header-section animate__animated animate__fadeInDown">
      <h1 class="page-title">作品展示</h1>
      <p class="page-subtitle">探索社团成员的精彩创作</p>
    </div>

    <el-tabs v-model="activeTab" class="portfolio-tabs animate__animated animate__fadeInUp">
      <el-tab-pane v-for="type in types" :key="type.value" :label="type.label" :name="type.value">
        <div class="masonry" v-if="filteredPortfolios.length > 0">
          <div v-for="item in filteredPortfolios" :key="item._id" class="item animate__animated animate__zoomIn">
            <el-card :body-style="{ padding: '0px' }" class="portfolio-card" @click="handleCardClick(item)">
              <div class="image-wrapper">
                <template v-if="item.type === 'video'">
                  <video
                    v-if="item.thumbnailUrl || item.url"
                    class="video"
                    :src="resolveImageUrl(item.thumbnailUrl || item.url)"
                    muted
                    playsinline
                    preload="metadata"
                  ></video>
                  <div class="video-badge">视频</div>
                  <div class="overlay">
                    <el-button type="primary" circle :icon="VideoPlay" />
                  </div>
                </template>
                <template v-else>
                  <img
                    :src="resolveImageUrl(item.thumbnailUrl || 'https://via.placeholder.com/300')"
                    class="image"
                    loading="lazy"
                  />
                  <div class="overlay">
                    <el-button type="primary" circle :icon="ZoomIn" />
                  </div>
                </template>
              </div>
              <div class="card-content">
                <span class="card-title">{{ item.title }}</span>
                <div class="bottom">
                  <div class="author">
                    <el-avatar
                      :size="24"
                      :src="item.user?.avatarUrl ? resolveImageUrl(item.user.avatarUrl) : ''"
                    >
                      {{ item.user?.username?.[0] || '作' }}
                    </el-avatar>
                    <span class="username">{{ item.user?.username || '未知作者' }}</span>
                  </div>
                  <time class="time">{{ new Date(item.createdAt).toLocaleDateString() }}</time>
                </div>
              </div>
            </el-card>
          </div>
        </div>
        <div class="empty-state" v-else>
          <el-empty :description="`${type.label}板块正在建设中...`" />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ZoomIn, VideoPlay } from '@element-plus/icons-vue';
import request from '../utils/request';

const router = useRouter();
const activeTab = ref('photo');
const portfolios = ref<any[]>([]);

const types = [
  { label: '摄影作品', value: 'photo' },
  { label: '视频创作', value: 'video' },
  { label: '后期修图', value: 'post_prod' }
];

const fetchPortfolios = async () => {
  try {
    const res = await request.get('/portfolios');
    portfolios.value = res as any;
  } catch (error) {
    console.error('Failed to fetch portfolios', error);
  }
};

const filteredPortfolios = computed(() => {
  return portfolios.value.filter(p => p.type === activeTab.value);
});

const handleCardClick = (item: any) => {
  if (!item._id) {
    return;
  }
  router.push(`/portfolio/${item._id}`);
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

onMounted(() => {
  fetchPortfolios();
});
</script>

<style scoped>
.portfolio-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.header-section {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 10px;
}

.page-subtitle {
  font-size: 1.2rem;
  color: #666;
}

.masonry {
  column-count: 4;
  column-gap: 20px;
}

@media (max-width: 992px) {
  .masonry {
    column-count: 3;
  }
}

@media (max-width: 768px) {
  .masonry {
    column-count: 2;
  }
}

@media (max-width: 480px) {
  .masonry {
    column-count: 1;
  }
}

.item {
  break-inside: avoid;
  margin-bottom: 20px;
}

.portfolio-card {
  transition: all 0.3s;
  overflow: hidden;
  border: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  cursor: pointer;
}

.portfolio-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.12);
}

.image-wrapper {
  position: relative;
  overflow: hidden;
  width: 100%;
  padding-top: 56.25%;
}

.image,
.video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  transition: transform 0.5s;
}

.portfolio-card:hover .image,
.portfolio-card:hover .video {
  transform: scale(1.05);
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.portfolio-card:hover .overlay {
  opacity: 1;
}

.card-content {
  padding: 14px;
}

.card-title {
  font-weight: 600;
  font-size: 1.1rem;
  display: block;
  margin-bottom: 10px;
  color: #333;
}

.bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  font-size: 0.9rem;
  color: #666;
}

.time {
  font-size: 0.8rem;
  color: #999;
}

.empty-state {
  padding: 40px 0;
}
</style>
