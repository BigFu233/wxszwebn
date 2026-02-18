import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Portfolio from '../views/Portfolio.vue'
import PortfolioDetail from '../views/PortfolioDetail.vue'
import Dashboard from '../views/Dashboard.vue'
import Upload from '../views/Upload.vue'
import Admin from '../views/Admin.vue'
import Members from '../views/Members.vue'
import About from '../views/About.vue'
import Favorites from '../views/Favorites.vue'
import Settings from '../views/Settings.vue'
import MyPortfolios from '../views/MyPortfolios.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { title: '首页 - 无限摄制社团' }
    },
    {
      path: '/about',
      name: 'about',
      component: About,
      meta: { title: '关于社团' }
    },
    {
      path: '/members',
      name: 'members',
      component: Members,
      meta: { title: '社员风采' }
    },
    {
      path: '/portfolio',
      name: 'portfolio',
      component: Portfolio,
      meta: { title: '作品展示' }
    },
    {
      path: '/portfolio/:id',
      name: 'portfolio-detail',
      component: PortfolioDetail,
      meta: { title: '作品详情' }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true, title: '个人中心' }
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: Favorites,
      meta: { requiresAuth: true, title: '我的收藏' }
    },
    {
      path: '/my-portfolios',
      name: 'my-portfolios',
      component: MyPortfolios,
      meta: { requiresAuth: true, title: '我的作品' }
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings,
      meta: { requiresAuth: true, title: '账号设置' }
    },
    {
      path: '/upload',
      name: 'upload',
      component: Upload,
      meta: { requiresAuth: true, role: ['member', 'admin'], title: '提交作品' }
    },
    {
      path: '/admin',
      name: 'admin',
      component: Admin,
      meta: { requiresAuth: true, role: 'admin', title: '管理后台' }
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { title: '登录' }
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: { title: '注册' }
    }
  ]
})

router.beforeEach((to, _from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title as string
  }
  
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next('/login')
    return
  }

  const requiredRole = to.meta.role as any
  if (requiredRole) {
    const userRole = authStore.user?.role
    if (Array.isArray(requiredRole)) {
      if (!userRole || !requiredRole.includes(userRole)) {
        next('/')
        return
      }
    } else if (userRole !== requiredRole) {
      next('/')
      return
    }
  }

  next()
})

export default router
