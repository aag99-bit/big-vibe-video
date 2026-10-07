<template>
  <div id="app">
    <nav v-if="authStore.isAuthenticated" class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900">Todo App</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">{{ authStore.user?.email }}</span>
            
            <!-- Кнопка Админ-панель (видна только админам) -->
            <router-link 
              v-if="authStore.isAdmin" 
              to="/admin" 
              class="text-sm bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700"
            >
              ⚙️ Админ-панель
            </router-link>
            
            <router-link to="/profile" class="text-sm text-blue-600 hover:text-blue-800">Профиль</router-link>
            <button
              @click="handleLogout"
              class="text-sm text-red-600 hover:text-red-800"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>
    </nav>
    
    <router-view />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>