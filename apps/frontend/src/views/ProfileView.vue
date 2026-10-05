<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-md mx-auto px-4">
      <div class="bg-white shadow rounded-lg p-6 space-y-6">
        <h1 class="text-2xl font-bold text-gray-900">Профиль</h1>
        <p class="text-sm text-gray-600">Текущий email: <strong>{{ authStore.user?.email }}</strong></p>

        <div>
          <h2 class="text-lg font-semibold text-gray-800 mb-2">Сменить email</h2>
          <form @submit.prevent="changeEmail" class="space-y-2">
            <input v-model="newEmail" type="email" required placeholder="Новый email"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" :disabled="loading"
              class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              Сохранить email
            </button>
          </form>
        </div>

        <hr />

        <div>
          <h2 class="text-lg font-semibold text-gray-800 mb-2">Сменить пароль</h2>
          <form @submit.prevent="changePassword" class="space-y-2" autocomplete="off">
            <div class="relative">
              <input v-model="newPassword" :type="showPassword ? 'text' : 'password'" required
                placeholder="Новый пароль (мин. 6 символов)"
                class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <span @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer select-none text-xl z-20"
                :title="showPassword ? 'Скрыть' : 'Показать'">
                {{ showPassword ? '🙈' : '👁️' }}
              </span>
            </div>
            <div class="relative">
              <input v-model="confirmPassword" :type="showPassword ? 'text' : 'password'" required
                placeholder="Повторите пароль"
                class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <p class="text-xs text-gray-500">Минимум 6 символов, одна заглавная буква и одна цифра</p>
            <button type="submit" :disabled="loading"
              class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              Сменить пароль
            </button>
          </form>
        </div>

        <div v-if="error" class="rounded-md bg-red-50 p-4 text-sm text-red-800">{{ error }}</div>
        <div v-if="success" class="rounded-md bg-green-50 p-4 text-sm text-green-800">{{ success }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { authAPI } from '../api.js'
import { useAuthStore } from '../stores/auth.js'

const authStore = useAuthStore()

const newEmail = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')
const success = ref('')

function passwordError(pw) {
  if (pw.length < 6) return 'Пароль: минимум 6 символов'
  if (!/[A-ZА-ЯЁ]/.test(pw)) return 'Пароль: нужна хотя бы одна заглавная буква'
  if (!/\d/.test(pw)) return 'Пароль: нужна хотя бы одна цифра'
  return ''
}

async function changeEmail() {
  loading.value = true
  error.value = ''
  success.value = ''
  try {
    await authAPI.updateProfile(newEmail.value)
    const profile = await authAPI.getProfile()
    authStore.user = profile
    localStorage.setItem('user', JSON.stringify(profile))
    success.value = '✓ Email обновлён'
    newEmail.value = ''
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function changePassword() {
  loading.value = true
  error.value = ''
  success.value = ''

  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Пароли не совпадают'
    loading.value = false
    return
  }

  const pwErr = passwordError(newPassword.value)
  if (pwErr) {
    error.value = pwErr
    loading.value = false
    return
  }

  try {
    await authAPI.resetPassword(authStore.user.email, newPassword.value)
    success.value = '✓ Пароль изменён. Используйте новый при следующем входе.'
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>