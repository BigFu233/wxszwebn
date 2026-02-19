<template>
  <div class="my-tasks-container">
    <div class="header-section animate__animated animate__fadeInDown">
      <h1 class="page-title">我的任务</h1>
      <p class="page-subtitle">查看并参与管理员分配的社团任务</p>
    </div>

    <el-card class="tasks-card animate__animated animate__fadeInUp">
      <el-table :data="tasks" style="width: 100%" v-loading="loading">
        <el-table-column prop="title" label="任务标题" />
        <el-table-column prop="type" label="任务类型" width="120">
          <template #default="scope">
            <el-tag>{{ formatType(scope.row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deadline" label="截止日期" width="160">
          <template #default="scope">
            {{ formatDate(scope.row.deadline) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="我的状态" width="120">
          <template #default="scope">
            <el-tag :type="statusTagType(scope.row.assignmentStatus)">
              {{ formatAssignmentStatus(scope.row.assignmentStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" type="primary" @click="goToUpload(scope.row)">
              提交作品
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import request from '../utils/request';

const tasks = ref<any[]>([]);
const loading = ref(false);

const fetchMyTasks = async () => {
  loading.value = true;
  try {
    const res = await request.get('/tasks/mine');
    tasks.value = Array.isArray(res) ? res : [];
  } catch (error) {
    ElMessage.error('获取任务失败');
  } finally {
    loading.value = false;
  }
};

const formatDate = (value: string | Date) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString();
};

const formatType = (type: string) => {
  const map: Record<string, string> = {
    photo: '摄影',
    video: '视频',
    post_prod: '后期'
  };
  return map[type] || '通用';
};

const formatAssignmentStatus = (status: string) => {
  const map: Record<string, string> = {
    pending: '待完成',
    submitted: '已提交',
    approved: '已通过'
  };
  return map[status] || '待完成';
};

const statusTagType = (status: string) => {
  if (status === 'approved') return 'success';
  if (status === 'submitted') return 'warning';
  return 'info';
};

const goToUpload = (_task: any) => {
  window.location.href = '/upload';
};

onMounted(() => {
  fetchMyTasks();
});
</script>

<style scoped>
.my-tasks-container {
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

.tasks-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
</style>
