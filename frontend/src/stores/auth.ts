import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import request from '../utils/request';

interface User {
  id: number;
  username: string;
  email?: string;
  role: string;
  avatarUrl?: string;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '');
  const user = ref<User | null>(JSON.parse(localStorage.getItem('user') || 'null'));

  const isLoggedIn = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin');
  const isMember = computed(() => user.value?.role === 'member' || user.value?.role === 'admin');

  async function login(credentials: any) {
    try {
      const res: any = await request.post('/auth/login', credentials);
      token.value = res.token;
      user.value = res.user;
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      return res;
    } catch (error) {
      throw error;
    }
  }

  async function register(data: any) {
    try {
      const res = await request.post('/auth/register', data);
      return res;
    } catch (error) {
      throw error;
    }
  }

  function logout() {
    token.value = '';
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return { token, user, isLoggedIn, isAdmin, isMember, login, register, logout };
});
