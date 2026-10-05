<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Создать аккаунт</h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Уже есть аккаунт?
          <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500">Войти</router-link>
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleRegister" autocomplete="off">
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
              class="appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Пароль" />
            <span @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer select-none text-xl z-20"
              :title="showPassword ? 'Скрыть пароль' : 'Показать пароль'">
              {{ showPassword ? '🙈' : '👁️' }}
            </span>
          </div>

          <div class="relative z-20">
            <label for="confirm" class="sr-only">Подтверждение пароля</label>
            <input id="confirm" v-model="confirmPassword" :type="showPassword ? 'text' : 'password'" required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Повторите пароль" />
          </div>
        </div>

        <p class="text-xs text-gray-500">Минимум 6 символов, одна заглавная буква и одна цифра</p>

        <div v-if="confirmError" class="rounded-md bg-yellow-50 p-4">
          <div class="text-sm text-yellow-800">{{ confirmError }}</div>
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
            <span v-else>Зарегистрироваться</span>
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
const confirmPassword = ref('')
const showPassword = ref(false)
const successMsg = ref('')
const confirmError = ref('')

function passwordError(pw) {
  if (pw.length < 6) return 'Пароль: минимум 6 символов'
  if (!/[A-ZА-ЯЁ]/.test(pw)) return 'Пароль: нужна хотя бы одна заглавная буква'
  if (!/\d/.test(pw)) return 'Пароль: нужна хотя бы одна цифра'
  return ''
}

async function handleRegister() {
  successMsg.value = ''
  confirmError.value = ''
  authStore.error = null

  if (password.value !== confirmPassword.value) {
    confirmError.value = 'Пароли не совпадают'
    return
  }

  const pwErr = passwordError(password.value)
  if (pwErr) {
    confirmError.value = pwErr
    return
  }

  const success = await authStore.register(email.value, password.value)
  if (success) {
    successMsg.value = '✓ Регистрация прошла успешно! Переходим к задачам...'
    setTimeout(() => router.push('/'), 1200)
  }
}
</script>