import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue'),
    meta: { requiresGuest: true }
  },

    {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/',
    name: 'Todos',
    component: () => import('../components/TodoList.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  // Если маршрут требует авторизации, а токена нет
  if (to.meta.requiresAuth && !token) {
    return next('/login')
  }
  
  // Если маршрут для гостей (login/register), а пользователь уже авторизован
  if (to.meta.requiresGuest && token) {
    return next('/')
  }
  
  next()
})

export default router