<template>
  <div class="max-w-2xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">Редактирование пользователя</h1>
    
    <div v-if="loading" class="text-center py-10">Загрузка...</div>
    <div v-else-if="loadError" class="p-4 bg-red-100 text-red-700 rounded">{{ loadError }}</div>
    
    <form v-else @submit.prevent="saveUser" class="bg-white shadow rounded-lg p-6">
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">Email</label>
        <input v-model="email" type="email" required
               class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
      </div>
      
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">Новый пароль (оставьте пустым, если не менять)</label>
        <input v-model="newPassword" type="password" placeholder="Минимум 6 символов"
               class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
      </div>
      
      <div class="mb-6">
        <label class="flex items-center cursor-pointer">
          <input v-model="isAdmin" type="checkbox" class="mr-2 w-4 h-4">
          <span class="text-sm font-medium">Администратор</span>
        </label>
      </div>
      
      <div class="flex gap-4">
        <button type="submit" :disabled="saving"
                class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {{ saving ? 'Сохранение...' : 'Сохранить' }}
        </button>
        <router-link to="/admin" class="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400">
          Отмена
        </router-link>
      </div>
      
      <div v-if="error" class="mt-4 p-3 bg-red-100 text-red-700 rounded">{{ error }}</div>
      <div v-if="success" class="mt-4 p-3 bg-green-100 text-green-700 rounded">Сохранено!</div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const email = ref('')
const isAdmin = ref(false)
const newPassword = ref('')
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref(false)
const loadError = ref('')

onMounted(async () => {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`/api/admin/users/${route.params.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Не удалось загрузить пользователя')
    const user = await res.json()
    email.value = user.email
    isAdmin.value = !!user.is_admin
  } catch (err) {
    loadError.value = err.message
  } finally {
    loading.value = false
  }
})

async function saveUser() {
  saving.value = true
  error.value = ''
  success.value = false
  
  try {
    const token = localStorage.getItem('token')
    const payload = {
      email: email.value,
      is_admin: isAdmin.value
    }
    if (newPassword.value) {
      payload.password = newPassword.value
    }
    
    const res = await fetch(`/api/admin/users/${route.params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
    
    const data = await res.json()
    
    if (!res.ok) {
      throw new Error(data.error || 'Ошибка сохранения')
    }
    
    success.value = true
    newPassword.value = ''
    
    setTimeout(() => router.push('/admin'), 1000)
  } catch (err) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}
</script>