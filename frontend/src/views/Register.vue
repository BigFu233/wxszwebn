<template>
  <div class="register-container">
    <div class="register-wrapper animate__animated animate__fadeIn">
      <div class="register-left">
        <div class="overlay">
          <h1>加入我们</h1>
          <p>开启您的创意之旅</p>
        </div>
      </div>
      <div class="register-right">
        <h2 class="form-title">注册账号</h2>
        <el-form :model="form" label-position="top" size="large">
          <el-form-item label="用户名">
            <el-input v-model="form.username" placeholder="请输入用户名">
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="form.email" placeholder="请输入邮箱">
              <template #prefix>
                <el-icon><Message /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password>
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="form.phone" placeholder="请输入手机号">
              <template #prefix>
                <el-icon><Iphone /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" class="submit-btn" :loading="loading" @click="onSubmit">注册</el-button>
          </el-form-item>
          <div class="form-footer">
            <span>已有账号？</span>
            <router-link to="/login">立即登录</router-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Lock, Message, Iphone } from '@element-plus/icons-vue';

const authStore = useAuthStore();
const router = useRouter();
const loading = ref(false);

const form = reactive({
  username: '',
  email: '',
  password: '',
  phone: ''
});

const onSubmit = async () => {
  if (!form.username || !form.email || !form.password) {
    ElMessage.warning('请填写所有必填项');
    return;
  }

  loading.value = true;
  try {
    await authStore.register(form);
    ElMessage.success('注册成功，请登录');
    router.push('/login');
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '注册失败');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  background-image: url('data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%239C92AC" fill-opacity="0.1" fill-rule="evenodd"%3E%3Ccircle cx="3" cy="3" r="3"/%3E%3Ccircle cx="13" cy="13" r="3"/%3E%3C/g%3E%3C/svg%3E');
}

.register-wrapper {
  display: flex;
  width: 900px;
  height: 650px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  overflow: hidden;
}

.register-left {
  flex: 1;
  background: url('https://picsum.photos/800/600?random=2') no-repeat center center/cover;
  position: relative;
}

.register-left .overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.8), rgba(255, 159, 67, 0.8));
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
  padding: 20px;
}

.register-left h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.register-left p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.register-right {
  flex: 1;
  padding: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 1.8rem;
}

.submit-btn {
  width: 100%;
  margin-top: 10px;
  font-size: 1.1rem;
}

.form-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 0.9rem;
  color: #666;
}

.form-footer a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  margin-left: 5px;
}
</style>