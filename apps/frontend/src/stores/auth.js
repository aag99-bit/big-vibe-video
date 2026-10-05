import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '../api.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  async function login(email, password) {
    loading.value = true
    error.value = null
    
    try {
      const response = await authAPI.login(email, password)
      token.value = response.token
      user.value = response.user
      
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      return true
    } catch (err) {
      error.value = err.message
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
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  function logout() {
    authAPI.logout()
    token.value = null
    user.value = null
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout
  }
})