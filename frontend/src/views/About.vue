<template>
  <div class="about-page animate__animated animate__fadeIn">
    <div class="header-section">
      <h1>社团概况</h1>
      <p>了解我们的故事与愿景</p>
    </div>

    <div class="container">
      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="5" animated />
      </div>
      
      <div v-else class="about-content">
        <el-card class="content-card">
          <div class="markdown-body" v-html="formattedContent"></div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useSiteSettingsStore } from '../stores/siteSettings';
import { storeToRefs } from 'pinia';

const siteSettingsStore = useSiteSettingsStore();
const { loading } = storeToRefs(siteSettingsStore);
const aboutContent = computed(() => siteSettingsStore.$state.aboutContent || '暂无社团概况内容。');

// Simple formatter for newlines, in a real app you might use a markdown parser
const formattedContent = computed(() => {
  return aboutContent.value.replace(/\n/g, '<br>');
});

onMounted(() => {
  siteSettingsStore.fetchSettings();
});
</script>

<style scoped>
.about-page {
  padding: 40px 0;
  min-height: 80vh;
}

.header-section {
  text-align: center;
  margin-bottom: 50px;
}

.header-section h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 10px;
}

.header-section p {
  color: #666;
  font-size: 1.2rem;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

.content-card {
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  font-size: 1.1rem;
  line-height: 1.8;
  color: #333;
}
</style>