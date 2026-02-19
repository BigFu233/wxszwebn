<template>
  <div class="home">
    <!-- Hero Carousel Section -->
    <div class="hero-carousel-wrapper">
      <el-carousel 
        trigger="click" 
        height="100vh" 
        :interval="6000" 
        arrow="always" 
        pause-on-hover="false"
        @change="handleCarouselChange"
      >
        <el-carousel-item v-for="(item, index) in carouselItems" :key="index">
          <div class="carousel-bg" :style="{ backgroundImage: `url(${item.image})` }"></div>
          <div class="carousel-overlay"></div>
          <div class="hero-content">
            <h1 
              class="title animate__animated animate__fadeInDown" 
              v-if="currentIndex === index"
            >
              {{ item.title }}
            </h1>
            <p 
              class="subtitle animate__animated animate__fadeInUp animate__delay-1s" 
              v-if="currentIndex === index"
            >
              {{ item.subtitle }}
            </p>
            <p 
              class="description animate__animated animate__fadeInUp animate__delay-1s" 
              v-if="currentIndex === index"
            >
              {{ item.description }}
            </p>
            <div 
              class="hero-buttons animate__animated animate__fadeInUp animate__delay-2s" 
              v-if="currentIndex === index"
            >
              <el-button type="primary" size="large" round class="glow-btn" @click="handleCarouselClick(item)">探索更多</el-button>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- About Section -->
    <div class="section about-section">
      <div class="container">
        <h2 class="section-title animate__animated animate__fadeIn">关于我们</h2>
        <div class="about-grid">
          <div class="about-card animate__animated animate__fadeInLeft">
            <el-icon class="about-icon"><Camera /></el-icon>
            <h3>摄影</h3>
            <p>从人像到风光，从纪实到创意，我们用镜头捕捉世界的每一处精彩。</p>
          </div>
          <div class="about-card animate__animated animate__fadeInUp">
            <el-icon class="about-icon"><VideoCamera /></el-icon>
            <h3>摄像</h3>
            <p>短片、微电影、活动记录，用动态影像讲述动人的故事。</p>
          </div>
          <div class="about-card animate__animated animate__fadeInRight">
            <el-icon class="about-icon"><Monitor /></el-icon>
            <h3>后期</h3>
            <p>PS、LR、PR、AE，精湛的后期技术让作品焕发新生。</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="section features-section">
      <div class="container">
        <div class="feature-content animate__animated animate__fadeIn">
          <h2 class="section-title">社团特色</h2>
          <el-row :gutter="40">
            <el-col :xs="24" :md="8">
              <div class="feature-item">
                <h3>专业设备支持</h3>
                <p>社团提供专业的单反、微单、灯光及稳定器设备，供会员借用和学习。</p>
              </div>
            </el-col>
            <el-col :xs="24" :md="8">
              <div class="feature-item">
                <h3>定期外拍活动</h3>
                <p>每月组织主题外拍，探索城市角落，亲近自然风光，实战中提升技术。</p>
              </div>
            </el-col>
            <el-col :xs="24" :md="8">
              <div class="feature-item">
                <h3>年度作品展</h3>
                <p>每年举办社团年度作品展，优秀作品更有机会印制成册或在校内外展出。</p>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>

    <!-- Video Showcase Section -->
    <div class="section video-section">
      <div class="container">
        <h2 class="section-title animate__animated animate__fadeIn">精选视频</h2>
        <div class="video-carousel-wrapper animate__animated animate__fadeInUp">
          <el-carousel :interval="4000" type="card" height="400px">
            <el-carousel-item v-for="video in featuredVideos" :key="video._id">
              <div class="video-card" @click="handleVideoClick(video)">
                <div class="video-thumbnail">
                  <img :src="video.thumbnail || 'https://via.placeholder.com/800x450?text=Video'" alt="Video Thumbnail" />
                  <div class="play-icon">
                    <el-icon><VideoPlay /></el-icon>
                  </div>
                </div>
                <div class="video-info">
                  <h3>{{ video.title }}</h3>
                  <p>{{ video.description || '暂无描述' }}</p>
                </div>
              </div>
            </el-carousel-item>
          </el-carousel>
          <div v-if="featuredVideos.length === 0" class="empty-state">
             <el-empty description="暂无精选视频" />
          </div>
        </div>
      </div>
    </div>

    <!-- Members Section -->
    <div class="section members-section">
      <div class="container">
        <h2 class="section-title animate__animated animate__fadeIn">社团成员</h2>
        <div class="members-grid">
          <div 
            v-for="member in displayMembers" 
            :key="member._id" 
            class="member-card animate__animated animate__fadeInUp"
            @click="showMemberProfile(member)"
            style="cursor: pointer"
          >
            <el-avatar
              :size="100"
              :src="member.avatarUrl ? resolveImageUrl(member.avatarUrl) : ''"
              class="member-avatar"
            >
              {{ member.username?.[0] || '成' }}
            </el-avatar>
            <h3 class="member-name">{{ member.username }}</h3>
            <p class="member-role">{{ formatRole(member.role) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Contact Section -->
    <div class="section contact-section">
      <div class="container">
        <h2 class="section-title animate__animated animate__fadeIn">联系我们</h2>
        <div class="contact-info animate__animated animate__fadeInUp">
          <div class="contact-item">
            <el-icon><Message /></el-icon>
            <p>邮箱：{{ contactEmail }}</p>
          </div>
          <div class="contact-item">
            <el-icon><Location /></el-icon>
            <p>地址：{{ contactAddress }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Video Player Dialog -->
    <el-dialog
      v-model="videoDialogVisible"
      :title="currentVideo?.title || '视频播放'"
      width="800px"
      align-center
      destroy-on-close
      @close="stopVideo"
    >
      <div class="video-player-container" v-if="currentVideo">
        <div v-if="isBilibiliLink(currentVideo.url)" class="iframe-container">
          <iframe 
            :src="getBilibiliEmbedUrl(currentVideo.url)" 
            frameborder="0" 
            allowfullscreen="true"
            sandbox="allow-top-navigation allow-same-origin allow-forms allow-scripts"
            width="100%"
            height="450"
          ></iframe>
        </div>
        <video 
          v-else
          controls 
          autoplay
          width="100%" 
          :poster="currentVideo.thumbnail"
          style="max-height: 500px; background: black;"
        >
          <source :src="currentVideo.url" type="video/mp4">
          您的浏览器不支持视频播放。
        </video>
        <p class="video-desc-dialog">{{ currentVideo.description }}</p>
      </div>
    </el-dialog>

    <!-- Member Profile Dialog -->
    <el-dialog
      v-model="profileDialogVisible"
      title="成员简介"
      width="400px"
      align-center
    >
      <div class="profile-content" v-if="currentMember">
        <el-avatar
          :size="120"
          :src="currentMember.avatarUrl ? resolveImageUrl(currentMember.avatarUrl) : ''"
          class="profile-avatar-large"
        >
          {{ currentMember.username?.[0] || '成' }}
        </el-avatar>
        <h2 class="profile-name">{{ currentMember.username }}</h2>
        <el-tag class="profile-role" size="large">{{ formatRole(currentMember.role) }}</el-tag>
        <div class="profile-details">
          <p><strong>邮箱：</strong> {{ currentMember.email }}</p>
          <p><strong>加入时间：</strong> {{ new Date(currentMember.createdAt).toLocaleDateString() }}</p>
          <p v-if="currentMember.phone"><strong>联系电话：</strong> {{ currentMember.phone }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Camera, VideoCamera, Monitor, VideoPlay, Message, Location } from '@element-plus/icons-vue'
import { useSiteSettingsStore, type CarouselItem } from '../stores/siteSettings';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import request from '../utils/request';

const router = useRouter();
const siteSettingsStore = useSiteSettingsStore();
const { carouselItems, featuredVideos, featuredMembers, contactEmail, contactAddress } = storeToRefs(siteSettingsStore);
const currentIndex = ref(0);

// Data for new sections
const members = ref<any[]>([]);

// Video Player Logic
const videoDialogVisible = ref(false);
const currentVideo = ref<any>(null);

// Member Profile Logic
const profileDialogVisible = ref(false);
const currentMember = ref<any>(null);

const handleCarouselChange = (index: number) => {
  currentIndex.value = index;
};

const handleCarouselClick = (item: CarouselItem) => {
  if (item.link) {
    if (item.link.startsWith('http')) {
      window.open(item.link, '_blank');
    } else {
      router.push(item.link);
    }
  } else {
    router.push('/portfolio');
  }
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

// Fetch Data
const fetchData = async () => {
  try {
    const usersRes: any = await request.get('/users/public');
    if (Array.isArray(usersRes)) {
      members.value = usersRes;
    }
  } catch (error) {
    console.error('Failed to fetch home data', error);
  }
};

const displayMembers = computed(() => {
  // If featuredMembers are set in settings, filter from all members
  // featuredMembers in store is populated with objects from backend now
  if (featuredMembers.value && featuredMembers.value.length > 0) {
    return featuredMembers.value;
  }
  // Fallback to top 8 members if no featured members set
  return members.value.filter((u: any) => u.role !== 'guest').slice(0, 8);
});

const handleVideoClick = (video: any) => {
  // Check if it's a direct video link (mp4, webm, etc.) or just use iframe for everything if you prefer
  // For now, assuming direct link for <video> tag
  currentVideo.value = video;
  videoDialogVisible.value = true;
};

const stopVideo = () => {
  currentVideo.value = null;
};

const showMemberProfile = (member: any) => {
  currentMember.value = member;
  profileDialogVisible.value = true;
};

const isBilibiliLink = (url: string) => {
  return /bilibili\.com\/video\/BV|b23\.tv/.test(url);
};

const getBilibiliEmbedUrl = (url: string) => {
  // Extract BVID
  let bvid = '';
  const bvidMatch = url.match(/BV[a-zA-Z0-9]+/);
  if (bvidMatch) {
    bvid = bvidMatch[0];
  }
  
  if (bvid) {
    return `//player.bilibili.com/player.html?bvid=${bvid}&page=1&high_quality=1&danmaku=0`;
  }
  return url;
};

const formatRole = (role: string) => {
  const map: Record<string, string> = {
    admin: '管理员',
    member: '社团成员',
    guest: '访客'
  };
  return map[role] || role;
};

onMounted(() => {
  siteSettingsStore.fetchSettings();
  fetchData();
});
</script>

<style scoped>
.hero-carousel-wrapper {
  margin-top: -60px; /* Compensate for fixed header */
  position: relative;
  width: 100%;
  overflow: hidden;
}

.carousel-bg {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  animation: kenBurns 20s infinite alternate;
  transform-origin: center center;
}

@keyframes kenBurns {
  0% { transform: scale(1); }
  100% { transform: scale(1.15); }
}

.carousel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.8) 100%);
}

.hero-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
  width: 90%;
  max-width: 900px;
  z-index: 10;
  /* Prevent content from capturing mouse events if not needed, but buttons need events */
  pointer-events: none;
}

.hero-content > * {
  pointer-events: auto;
}

.title {
  font-size: 5rem;
  margin-bottom: 1rem;
  font-weight: 800;
  text-shadow: 0 4px 10px rgba(0,0,0,0.5);
  letter-spacing: 2px;
}

.subtitle {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  font-weight: 300;
  opacity: 0.95;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.description {
  font-size: 1.2rem;
  margin-bottom: 3rem;
  line-height: 1.8;
  opacity: 0.9;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.hero-buttons {
  display: flex;
  gap: 25px;
  justify-content: center;
}

.glow-btn {
  box-shadow: 0 0 20px rgba(64, 158, 255, 0.5);
  transition: all 0.3s;
}

.glow-btn:hover {
  box-shadow: 0 0 30px rgba(64, 158, 255, 0.8);
  transform: translateY(-2px);
}

.outline-btn {
  background: transparent !important;
  border: 2px solid white !important;
  color: white !important;
}

.outline-btn:hover {
  background: white !important;
  color: #333 !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .title {
    font-size: 3rem;
  }
  .subtitle {
    font-size: 1.5rem;
  }
  .description {
    font-size: 1rem;
    display: none; /* Hide description on mobile for cleaner look */
  }
}

.section {
  padding: 80px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 60px;
  color: #333;
  position: relative;
}

.section-title::after {
  content: '';
  display: block;
  width: 60px;
  height: 4px;
  background-color: var(--primary-color);
  margin: 20px auto 0;
  border-radius: 2px;
}

.about-section {
  background-color: #fff;
}

.about-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
}

.about-card {
  text-align: center;
  padding: 40px;
  border-radius: 12px;
  background-color: #f9f9f9;
  transition: transform 0.3s, box-shadow 0.3s;
}

.about-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.about-icon {
  font-size: 4rem;
  color: var(--primary-color);
  margin-bottom: 20px;
}

.about-card h3 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #333;
}

.about-card p {
  color: #666;
  line-height: 1.6;
}

.features-section {
  background-color: #f5f7fa;
}

.feature-item {
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border-left: 4px solid var(--primary-color);
  transition: transform 0.3s;
}

.feature-item:hover {
  transform: translateX(10px);
}

.feature-item h3 {
  font-size: 1.3rem;
  margin-bottom: 10px;
  color: #333;
}

.feature-item p {
  color: #666;
  line-height: 1.6;
}

/* Video Section */
.video-section {
  background-color: #2c3e50;
  color: white;
}

.video-section .section-title {
  color: white;
}

.video-card {
  position: relative;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(0,0,0,0.3);
}

.video-thumbnail {
  height: 100%;
  position: relative;
}

.video-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.video-card:hover .video-thumbnail img {
  transform: scale(1.05);
}

.play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 4rem;
  color: rgba(255,255,255,0.8);
  transition: transform 0.3s, color 0.3s;
}

.video-card:hover .play-icon {
  transform: translate(-50%, -50%) scale(1.2);
  color: white;
}

.video-info {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
  color: white;
}

.video-info h3 {
  margin: 0 0 5px 0;
  font-size: 1.2rem;
}

.video-info p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

/* Members Section */
.members-section {
  background-color: white;
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 30px;
  text-align: center;
}

.member-card {
  padding: 20px;
  border-radius: 12px;
  transition: transform 0.3s;
}

.member-card:hover {
  transform: translateY(-5px);
}

.member-avatar {
  margin-bottom: 15px;
  border: 4px solid #f0f2f5;
  transition: border-color 0.3s;
}

.member-card:hover .member-avatar {
  border-color: var(--primary-color);
}

.member-name {
  font-size: 1.2rem;
  margin: 0 0 5px 0;
  color: #333;
}

/* Video Player Styles */
.video-player-container {
  text-align: center;
}

.video-desc-dialog {
  margin-top: 15px;
  color: #666;
  font-size: 1rem;
}

/* Contact Section */
.contact-section {
  background-color: #2c3e50;
  color: white;
}

.contact-section .section-title {
  color: white;
  margin-bottom: 40px;
}

.contact-info {
  display: flex;
  justify-content: center;
  gap: 60px;
  flex-wrap: wrap;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 1.2rem;
}

.contact-item .el-icon {
  font-size: 2rem;
  color: var(--primary-color);
}

.contact-item p {
  margin: 0;
}

/* Profile Dialog Styles */
.profile-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.profile-avatar-large {
  margin-bottom: 20px;
  border: 4px solid #f0f2f5;
}

.profile-name {
  margin: 0 0 10px 0;
  font-size: 1.8rem;
  color: #333;
}

.profile-role {
  margin-bottom: 30px;
}

.profile-details {
  width: 100%;
  text-align: left;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
}

.profile-details p {
  margin: 10px 0;
  font-size: 1rem;
  color: #666;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.profile-details p:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
</style>
