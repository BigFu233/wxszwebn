<template>
  <div class="login-container">
    <div class="login-wrapper animate__animated animate__fadeIn">
      <div class="login-left">
        <div class="overlay">
          <h1>欢迎回来</h1>
          <p>登录以继续您的创作之旅</p>
        </div>
      </div>
      <div class="login-right">
        <h2 class="form-title">用户登录</h2>
        <el-form :model="form" label-position="top" size="large">
          <el-form-item label="账号">
            <el-input v-model="form.identifier" placeholder="请输入邮箱或用户名">
              <template #prefix>
                <el-icon><User /></el-icon>
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
          <el-form-item>
            <el-button type="primary" class="submit-btn" :loading="loading" @click="onSubmit">登录</el-button>
          </el-form-item>
          <div class="form-footer">
            <span>还没有账号？</span>
            <router-link to="/register">立即注册</router-link>
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
import { User, Lock } from '@element-plus/icons-vue';

const authStore = useAuthStore();
const router = useRouter();
const loading = ref(false);

const form = reactive({
  identifier: '',
  password: '',
});

const onSubmit = async () => {
  if (!form.identifier || !form.password) {
    ElMessage.warning('请输入账号和密码');
    return;
  }
  
  loading.value = true;
  try {
    await authStore.login(form);
    ElMessage.success('登录成功');
    router.push('/');
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '登录失败');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  background-image: url('data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%239C92AC" fill-opacity="0.1" fill-rule="evenodd"%3E%3Ccircle cx="3" cy="3" r="3"/%3E%3Ccircle cx="13" cy="13" r="3"/%3E%3C/g%3E%3C/svg%3E');
}

.login-wrapper {
  display: flex;
  width: 900px;
  height: 550px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  overflow: hidden;
}

.login-left {
  flex: 1;
  background: url('https://picsum.photos/800/600?random=1') no-repeat center center/cover;
  position: relative;
}

.login-left .overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(64,158,255,0.8), rgba(54,207,201,0.8));
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
  padding: 20px;
}

.login-left h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.login-left p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.login-right {
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

@media (max-width: 768px) {
  .login-container {
    padding: 20px;
    height: auto;
    align-items: flex-start;
  }

  .login-wrapper {
    flex-direction: column;
    width: 100%;
    max-width: 500px;
    height: auto;
  }

  .login-left {
    height: 180px;
  }

  .login-right {
    padding: 30px 20px 40px;
  }
}
</style>
