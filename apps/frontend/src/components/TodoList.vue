<script setup>
import { ref, onMounted } from 'vue'
import { fetchTodos, createTodo, updateTodo, deleteTodo } from '../api.js'

const todos = ref([])
const newTodo = ref('')
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    todos.value = await fetchTodos()
  } catch (e) {
    console.error('Load error:', e)
  } finally {
    loading.value = false
  }
}

async function add() {
  const text = newTodo.value.trim()
  if (!text) return
  try {
    const created = await createTodo(text)
    todos.value.push(created)
    newTodo.value = ''
  } catch (e) {
    console.error('Add error:', e)
  }
}

async function toggle(todo) {
  try {
    const updated = await updateTodo(todo.id, { done: !todo.done })
    const idx = todos.value.findIndex(t => t.id === todo.id)
    if (idx !== -1) todos.value[idx] = updated
  } catch (e) {
    console.error('Toggle error:', e)
  }
}

async function remove(todo) {
  try {
    await deleteTodo(todo.id)
    todos.value = todos.value.filter(t => t.id !== todo.id)
  } catch (e) {
    console.error('Remove error:', e)
  }
}

onMounted(load)
</script>

<template>
  <div class="max-w-xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6 text-gray-800">Big Vibe Todos</h1>

    <form @submit.prevent="add" class="flex gap-2 mb-6">
      <input
        v-model="newTodo"
        type="text"
        placeholder="New task..."
        class="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Add
      </button>
    </form>

    <div v-if="loading" class="text-center py-8 text-gray-500">Loading...</div>

    <ul v-else class="space-y-2">
      <li
        v-for="todo in todos"
        :key="todo.id"
        class="flex items-center gap-3 p-3 border border-gray-200 rounded"
      >
        <input
          type="checkbox"
          :checked="todo.done"
          @change="toggle(todo)"
          class="w-5 h-5"
        />
        <span :class="{ 'line-through text-gray-500': todo.done }" class="flex-1">
          {{ todo.text }}
        </span>
        <button
          @click="remove(todo)"
          class="text-red-600 hover:text-red-800"
        >
          ✕
        </button>
      </li>
    </ul>

    <p v-if="!loading && todos.length === 0" class="text-center text-gray-500">
      No tasks yet
    </p>

    <p class="mt-6 text-xs text-gray-400 text-center">
      Connected to backend API · SQLite database
    </p>
  </div>
</template>