import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/TodoList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  // === РОУТЫ АДМИНКИ (ДОБАВИТЬ ЭТИ ДВА БЛОКА) ===
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/AdminView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/user/:id',
    name: 'AdminUserEdit',
    component: () => import('../views/AdminUserEdit.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  // =============================================
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const token = localStorage.getItem('token')
  const isAdmin = localStorage.getItem('isAdmin') === '1'

  if (to.meta.requiresAuth && !token) {
    return next('/login')
  }

  if (to.meta.requiresAdmin && !isAdmin) {
    return next('/')
  }

  next()
})

export default router