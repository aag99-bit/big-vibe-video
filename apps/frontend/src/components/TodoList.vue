<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchTodos, createTodo, updateTodo, deleteTodo } from '../api.js'

const todos = ref([])
const newTodo = ref('')
const loading = ref(false)
const filter = ref('all')

const filters = [
  { key: 'all', label: 'Все' },
  { key: 'active', label: 'Активные' },
  { key: 'done', label: 'Готово' }
]

const total = computed(() => todos.value.length)
const activeCount = computed(() => todos.value.filter(t => !t.done).length)
const doneCount = computed(() => todos.value.filter(t => t.done).length)

const visibleTodos = computed(() => {
  if (filter.value === 'active') return todos.value.filter(t => !t.done)
  if (filter.value === 'done') return todos.value.filter(t => t.done)
  return todos.value
})

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

async function clearDone() {
  const done = todos.value.filter(t => t.done)
  if (done.length === 0) return
  try {
    await Promise.all(done.map(t => deleteTodo(t.id)))
    todos.value = todos.value.filter(t => !t.done)
  } catch (e) {
    console.error('Clear error:', e)
  }
}

onMounted(load)
</script>

<template>
  <div class="max-w-xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-4 text-gray-800 text-center">📝 Todo List</h1>

    <p class="text-center text-gray-500 mb-6">
      Всего {{ total }} · Активно {{ activeCount }} · Выполнено {{ doneCount }}
    </p>

    <form @submit.prevent="add" class="flex gap-2 mb-4">
      <input
        v-model="newTodo"
        type="text"
        placeholder="Новая задача..."
        class="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Добавить
      </button>
    </form>

    <div class="flex items-center justify-between mb-6">
      <div class="flex gap-2">
        <button
          v-for="f in filters"
          :key="f.key"
          @click="filter = f.key"
          class="px-3 py-1 rounded-full transition"
          :class="filter === f.key
            ? 'bg-blue-100 text-blue-600 font-medium'
            : 'text-gray-600 hover:bg-gray-200'"
        >
          {{ f.label }}
        </button>
      </div>
      <button
        v-if="doneCount > 0"
        @click="clearDone"
        class="text-sm text-red-500 hover:text-red-700 transition"
      >
        Очистить выполненные
      </button>
    </div>

    <div v-if="loading" class="text-center py-8 text-gray-500">Загрузка...</div>

    <ul v-else class="space-y-2">
      <li
        v-for="todo in visibleTodos"
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
      Пока нет задач
    </p>
    <p v-else-if="!loading && visibleTodos.length === 0" class="text-center text-gray-500">
      В этом фильтре ничего нет
    </p>

    <p class="mt-6 text-xs text-gray-400 text-center">
      Подключено к backend API · база SQLite
    </p>
  </div>
</template>