<template>
  <div class="settings-container">
    <div class="header-section animate__animated animate__fadeInDown">
      <h1 class="page-title">账号设置</h1>
      <p class="page-subtitle">管理你的基本账号信息</p>
    </div>

    <el-card class="settings-card animate__animated animate__fadeInUp">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" autocomplete="off" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" autocomplete="off" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" autocomplete="off" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="saving" @click="onSubmit">保存修改</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { useAuthStore } from '../stores/auth';
import { storeToRefs } from 'pinia';
import request from '../utils/request';

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const formRef = ref<FormInstance | null>(null);
const form = reactive({
  username: '',
  email: '',
  phone: ''
});

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] }
  ]
};

const loading = ref(false);
const saving = ref(false);

const loadProfile = async () => {
  loading.value = true;
  try {
    const res: any = await request.get('/users/me');
    form.username = res.username || user.value?.username || '';
    form.email = res.email || '';
    form.phone = res.phone || '';
  } catch (error) {
    ElMessage.error('获取账号信息失败');
  } finally {
    loading.value = false;
  }
};

const onSubmit = () => {
  if (!formRef.value) return;
  formRef.value.validate(async (valid) => {
    if (!valid) return;
    saving.value = true;
    try {
      const res: any = await request.put('/users/me', {
        username: form.username,
        email: form.email,
        phone: form.phone
      });
      if (user.value) {
        user.value.username = res.username;
        user.value.email = res.email;
      }
      localStorage.setItem('user', JSON.stringify(user.value));
      ElMessage.success('保存成功');
    } catch (error: any) {
      const msg = error?.response?.data?.message || '保存失败';
      ElMessage.error(msg);
    } finally {
      saving.value = false;
    }
  });
};

onMounted(() => {
  loadProfile();
});
</script>

<style scoped>
.settings-container {
  max-width: 800px;
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

.settings-card {
  max-width: 600px;
  margin: 0 auto;
}
</style>
