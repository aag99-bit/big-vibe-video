<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Войти в аккаунт</h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Или
          <router-link to="/register" class="font-medium text-blue-600 hover:text-blue-500">создайте новый аккаунт</router-link>
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin" autocomplete="off">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">Email</label>
            <input id="email" v-model="email" type="email" required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Email" />
          </div>
          <div class="relative z-20">
            <label for="password" class="sr-only">Пароль</label>
            <input id="password" v-model="password" :type="showPassword ? 'text' : 'password'" required
              class="appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Пароль" />
            <span @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer select-none text-xl z-20"
              :title="showPassword ? 'Скрыть пароль' : 'Показать пароль'">
              {{ showPassword ? '🙈' : '👁️' }}
            </span>
          </div>
        </div>

        <div v-if="authStore.error" class="rounded-md bg-red-50 p-4">
          <div class="text-sm text-red-800">{{ authStore.error }}</div>
        </div>
        <div v-if="successMsg" class="rounded-md bg-green-50 p-4">
          <div class="text-sm text-green-800">{{ successMsg }}</div>
        </div>

        <div>
          <button type="submit" :disabled="authStore.loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
            <span v-if="authStore.loading">Загрузка...</span>
            <span v-else>Войти</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const successMsg = ref('')

async function handleLogin() {
  successMsg.value = ''
  const success = await authStore.login(email.value, password.value)
  if (success) {
    successMsg.value = '✓ Вход выполнен успешно! Переходим к задачам...'
    setTimeout(() => router.push('/'), 1200)
  }
}
</script>