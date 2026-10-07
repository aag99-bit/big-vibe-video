<template>
  <div class="max-w-6xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">Админ-панель: Пользователи</h1>
    
    <div v-if="loading" class="text-center py-10">Загрузка...</div>
    <div v-else-if="error" class="p-4 bg-red-100 text-red-700 rounded">{{ error }}</div>
    
    <div v-else>
      <table class="w-full bg-white shadow rounded-lg overflow-hidden">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-6 py-3 text-left">ID</th>
            <th class="px-6 py-3 text-left">Email</th>
            <th class="px-6 py-3 text-left">Роль</th>
            <th class="px-6 py-3 text-left">Создан</th>
            <th class="px-6 py-3 text-left">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="border-t hover:bg-gray-50">
            <td class="px-6 py-4">{{ user.id }}</td>
            <td class="px-6 py-4">{{ user.email }}</td>
            <td class="px-6 py-4">
              <span :class="user.is_admin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'" 
                    class="px-2 py-1 rounded text-xs">
                {{ user.is_admin ? 'Админ' : 'Пользователь' }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(user.created_at) }}</td>
            <td class="px-6 py-4">
              <router-link :to="`/admin/user/${user.id}`" 
                           class="text-blue-600 hover:underline">
                Редактировать
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const users = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Не удалось загрузить пользователей')
    users.value = await res.json()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('ru-RU')
}
</script>