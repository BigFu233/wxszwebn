<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { storeToRefs } from 'pinia'
import { ref, watch, onMounted, nextTick, computed } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'

const authStore = useAuthStore()
const { isLoggedIn, user } = storeToRefs(authStore)
const route = useRoute()

const activeTabStyle = ref({
  left: '0px',
  width: '0px',
  opacity: 0
})

const navLinksRef = ref<HTMLElement | null>(null)

const updateActiveTab = () => {
  nextTick(() => {
    if (!navLinksRef.value) return
    
    const activeLink = navLinksRef.value.querySelector('.active-link') as HTMLElement
    if (activeLink) {
      activeTabStyle.value = {
        left: `${activeLink.offsetLeft}px`,
        width: `${activeLink.offsetWidth}px`,
        opacity: 1
      }
    } else {
      activeTabStyle.value.opacity = 0
    }
  })
}

const resolveImageUrl = (url: string) => {
  if (!url) return ''
  const uploadsIndex = url.indexOf('/uploads/')
  if (uploadsIndex !== -1) {
    const path = url.substring(uploadsIndex)
    const isNetlify = window.location.hostname.endsWith('netlify.app')
    return isNetlify ? `/.netlify/functions/proxy${path}` : `http://112.124.10.28${path}`
  }
  return url
}

const headerAvatarSrc = computed(() => {
  if (user.value?.avatarUrl) {
    return resolveImageUrl(user.value.avatarUrl)
  }
  return ''
})

watch(
  () => route.path,
  () => {
    updateActiveTab()
  }
)

onMounted(() => {
  updateActiveTab()
  window.addEventListener('resize', updateActiveTab)
})
</script>

<template>
  <el-container class="layout-container">
    <el-header class="header">
      <div class="header-content">
        <div class="logo animate__animated animate__fadeInLeft">
          <router-link to="/">
            <img src="/logo2.png" alt="无限摄制社团" class="logo-image" />
          </router-link>
        </div>
        
        <div class="nav-container animate__animated animate__fadeInDown">
          <div class="nav-links" ref="navLinksRef">
            <div class="active-tab-indicator" :style="activeTabStyle"></div>
            <router-link to="/" active-class="active-link">首页</router-link>
            <router-link to="/about" active-class="active-link">社团概况</router-link>
            <router-link to="/members" active-class="active-link">社团成员</router-link>
            <router-link to="/portfolio" active-class="active-link">作品展示</router-link>
          </div>
        </div>

        <div class="user-actions animate__animated animate__fadeInRight">
          <template v-if="!isLoggedIn">
            <router-link to="/login" class="login-btn">登录</router-link>
          </template>
          
          <template v-else>
            <el-dropdown trigger="click">
              <span class="el-dropdown-link">
                <el-avatar :size="28" :src="headerAvatarSrc" class="header-avatar" />
                <span class="header-username">{{ user?.username || '用户' }}</span>
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="$router.push('/dashboard')">个人中心</el-dropdown-item>
                  <el-dropdown-item v-if="authStore.isAdmin" @click="$router.push('/admin')">管理后台</el-dropdown-item>
                  <el-dropdown-item divided @click="authStore.logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </div>
      </div>
    </el-header>

    <el-main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </el-main>

    <el-footer class="footer">
      <p>&copy; 2026 无限摄制社团 版权所有</p>
    </el-footer>
  </el-container>
</template>

<style>
/* Global Styles */
:root {
  --primary-color: #409EFF;
  --text-color: #303133;
  --bg-color: #f5f7fa;
}

body {
  margin: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #e6e6e6;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  height: 60px;
  padding: 0;
}

.header-avatar {
  margin-right: 8px;
}

.header-username {
  margin-right: 4px;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: grid;
  grid-template-columns: 200px 1fr 200px; /* Logo - Nav - User */
  align-items: center;
  padding: 0 20px;
}

.logo a {
  display: block;
}

.logo-image {
  height: 32px;
  width: auto;
  object-fit: contain;
  transition: opacity 0.3s;
  vertical-align: middle;
}

.logo-image:hover {
  opacity: 0.8;
}

.nav-container {
  display: flex;
  justify-content: center;
  height: 100%;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  height: 100%;
}

.nav-links a {
  text-decoration: none;
  color: #606266;
  font-weight: 500;
  font-size: 1rem;
  padding: 8px 20px;
  border-radius: 20px;
  transition: color 0.3s;
  position: relative;
  z-index: 1;
}

.nav-links a:hover {
  color: var(--primary-color);
}

.nav-links a.active-link {
  color: var(--primary-color);
}

/* Removing the old underline */
.nav-links a.active-link::after {
  display: none;
}

.active-tab-indicator {
  position: absolute;
  bottom: 10px; /* Adjust vertical position */
  height: 40px; /* Or match link height */
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(64, 158, 255, 0.1);
  border-radius: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
  pointer-events: none;
}

.user-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.login-btn {
  padding: 8px 20px;
  background-color: var(--primary-color);
  color: white !important;
  border-radius: 20px;
  transition: all 0.3s !important;
}

.login-btn:hover {
  background-color: #66b1ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.el-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  color: var(--primary-color);
  font-weight: 500;
}

.main-content {
  flex: 1;
  padding: 0;
  overflow-x: hidden;
}

.footer {
  background-color: #2c3e50;
  color: #fff;
  text-align: center;
  padding: 20px;
  font-size: 0.9rem;
}

/* Route Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
