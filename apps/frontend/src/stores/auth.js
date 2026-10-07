import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '../api.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)
  
  // ✅ ДОБАВЛЕНО: Вычисляемое свойство для проверки прав админа
  const isAdmin = computed(() => user.value?.is_admin === true)

  async function login(email, password) {
    loading.value = true
    error.value = null
    
    try {
      const response = await authAPI.login(email, password)
      token.value = response.token
      user.value = response.user // Бэкенд теперь отдаёт { id, email, is_admin }
      
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      localStorage.setItem('isAdmin', response.user.is_admin ? '1' : '0') 

      return true
    } catch (err) {
      error.value = err.response?.data?.error || err.message || 'Ошибка входа'
      return false
    } finally {
      loading.value = false
    }
  }

  async function register(email, password) {
    loading.value = true
    error.value = null
    
    try {
      await authAPI.register(email, password)
      // После успешной регистрации сразу логинимся
      return await login(email, password)
    } catch (err) {
      error.value = err.response?.data?.error || err.message || 'Ошибка регистрации'
      return false
    } finally {
      loading.value = false
    }
  }

  function logout() {
    authAPI.logout()
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user') // ✅ ДОБАВЛЕНО: явная очистка хранилища
    localStorage.removeItem('isAdmin') 
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,       // ✅ ДОБАВЛЕНО: экспортируем для использования в компонентах и роутере
    login,
    register,
    logout
  }
})