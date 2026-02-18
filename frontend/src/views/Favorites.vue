<template>
  <div class="favorites-container">
    <div class="header-section animate__animated animate__fadeInDown">
      <h1 class="page-title">我的收藏</h1>
      <p class="page-subtitle">你标记为喜爱的作品会显示在这里</p>
    </div>

    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="4" animated />
    </div>
    <div v-else-if="favorites.length === 0" class="empty-state">
      <el-empty description="还没有收藏任何作品，去作品展示页逛逛吧" />
      <el-button type="primary" @click="$router.push('/portfolio')">前往作品展示</el-button>
    </div>
    <div v-else class="masonry animate__animated animate__fadeInUp">
      <div v-for="item in favorites" :key="item._id" class="item animate__animated animate__zoomIn">
        <el-card :body-style="{ padding: '0px' }" class="portfolio-card" @click="handleCardClick(item)">
          <div class="image-wrapper">
            <img :src="item.thumbnailUrl || 'https://via.placeholder.com/300'" class="image" loading="lazy" />
            <div class="overlay">
              <el-button type="primary" circle :icon="ZoomIn" />
            </div>
          </div>
          <div class="card-content">
            <span class="card-title">{{ item.title }}</span>
            <div class="bottom">
              <div class="author">
                <el-avatar
                  :size="24"
                  :src="item.user?.avatarUrl || `https://i.pravatar.cc/150?u=${item.user?.username}`"
                />
                <span class="username">{{ item.user?.username || '未知作者' }}</span>
              </div>
              <time class="time">{{ new Date(item.createdAt).toLocaleDateString() }}</time>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ZoomIn } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import request from '../utils/request';

const favorites = ref<any[]>([]);
const loading = ref(false);

const fetchFavorites = async () => {
  loading.value = true;
  try {
    const res = await request.get('/portfolios/favorites/me');
    favorites.value = Array.isArray(res) ? res : [];
  } catch (error) {
    ElMessage.error('获取收藏作品失败');
  } finally {
    loading.value = false;
  }
};

const handleCardClick = (item: any) => {
  if (item.url) {
    window.open(item.url, '_blank');
  }
};

onMounted(() => {
  fetchFavorites();
});
</script>

<style scoped>
.favorites-container {
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

.loading-state {
  max-width: 800px;
  margin: 0 auto;
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
}

.image {
  width: 100%;
  display: block;
  transition: transform 0.5s;
}

.portfolio-card:hover .image {
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
  text-align: center;
}
</style>
