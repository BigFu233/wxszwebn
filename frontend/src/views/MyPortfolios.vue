<template>
  <div class="my-portfolios-container">
    <div class="header-section animate__animated animate__fadeInDown">
      <h1 class="page-title">我的作品</h1>
      <p class="page-subtitle">查看自己提交的作品及审核状态</p>
    </div>

    <el-card class="list-card animate__animated animate__fadeInUp">
      <div class="table-actions">
        <el-button type="primary" size="small" @click="fetchPortfolios">刷新列表</el-button>
        <el-button type="success" size="small" @click="$router.push('/upload')">提交新作品</el-button>
      </div>
      <el-table :data="portfolios" style="width: 100%" v-loading="loading">
        <el-table-column prop="thumbnailUrl" label="封面" width="120">
          <template #default="scope">
            <img
              v-if="scope.row.thumbnailUrl"
              :src="scope.row.thumbnailUrl"
              class="thumb"
            />
            <span v-else>无封面</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="scope">
            <el-tag>{{ formatType(scope.row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'approved' ? 'success' : 'warning'">
              {{ scope.row.status === 'approved' ? '已发布' : '待审核' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="提交时间" width="160">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 'approved'"
              size="small"
              type="primary"
              plain
              @click="viewDetail(scope.row._id)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="!loading && portfolios.length === 0" class="empty-state">
        <el-empty description="还没有提交过作品，快去创作一份吧～" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import request from '../utils/request';

const router = useRouter();
const portfolios = ref<any[]>([]);
const loading = ref(false);

const fetchPortfolios = async () => {
  loading.value = true;
  try {
    const res = await request.get('/portfolios/mine');
    portfolios.value = Array.isArray(res) ? res : [];
  } catch (error) {
    ElMessage.error('获取作品列表失败');
  } finally {
    loading.value = false;
  }
};

const formatType = (type: string) => {
  const map: Record<string, string> = {
    photo: '摄影作品',
    video: '视频创作',
    post_prod: '后期修图'
  };
  return map[type] || type;
};

const formatDate = (value: string | Date) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString();
};

const viewDetail = (id: string) => {
  router.push(`/portfolio/${id}`);
};

onMounted(() => {
  fetchPortfolios();
});
</script>

<style scoped>
.my-portfolios-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.header-section {
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 2rem;
  margin-bottom: 8px;
  color: #333;
}

.page-subtitle {
  font-size: 1rem;
  color: #666;
}

.list-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.table-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.thumb {
  width: 80px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.empty-state {
  margin-top: 20px;
}
</style>

