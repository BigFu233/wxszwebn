<template>
  <div class="members-page animate__animated animate__fadeIn">
    <div class="header-section">
      <h1>社团成员</h1>
      <p>认识我们的创意团队</p>
    </div>

    <div class="container">
      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="5" animated />
      </div>
      
      <div v-else class="members-grid">
        <div v-for="member in members" :key="member._id" class="member-card animate__animated animate__fadeInUp">
          <el-avatar
            :size="120"
            :src="member.avatarUrl || `https://i.pravatar.cc/150?u=${member.username}`"
            class="member-avatar"
          />
          <h3 class="member-name">{{ member.username }}</h3>
          <el-tag :type="getRoleType(member.role)" class="member-role">{{ formatRole(member.role) }}</el-tag>
          <div class="member-info">
            <p><el-icon><Message /></el-icon> {{ member.email }}</p>
            <p><el-icon><Calendar /></el-icon> 加入于 {{ new Date(member.createdAt).toLocaleDateString() }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Message, Calendar } from '@element-plus/icons-vue';
import request from '../utils/request';

const members = ref<any[]>([]);
const loading = ref(true);

const fetchMembers = async () => {
  loading.value = true;
  try {
    const res: any = await request.get('/users');
    if (Array.isArray(res)) {
      // Filter out guests if needed, or show all
      members.value = res.filter((u: any) => u.role !== 'guest');
    }
  } catch (error) {
    console.error('Failed to fetch members', error);
  } finally {
    loading.value = false;
  }
};

const formatRole = (role: string) => {
  const map: Record<string, string> = {
    admin: '管理员',
    member: '社团成员',
    guest: '访客'
  };
  return map[role] || role;
};

const getRoleType = (role: string) => {
  if (role === 'admin') return 'danger';
  if (role === 'member') return 'success';
  return 'info';
};

onMounted(() => {
  fetchMembers();
});
</script>

<style scoped>
.members-page {
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
}

.member-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.member-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.1);
}

.member-avatar {
  margin-bottom: 20px;
  border: 4px solid #f0f2f5;
}

.member-name {
  font-size: 1.5rem;
  margin: 0 0 10px 0;
  color: #333;
}

.member-role {
  margin-bottom: 20px;
}

.member-info {
  text-align: left;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.member-info p {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #666;
  margin: 8px 0;
  font-size: 0.95rem;
}

.member-info .el-icon {
  color: var(--primary-color);
}
</style>
