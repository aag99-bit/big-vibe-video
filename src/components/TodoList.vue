<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const todos = ref([])
const newTodoText = ref('')
const currentFilter = ref('all')

onMounted(() => {
  const saved = localStorage.getItem('todos')
  if (saved) todos.value = JSON.parse(saved)
})

// Автосохранение в localStorage
watch(todos, (newVal) => {
  localStorage.setItem('todos', JSON.stringify(newVal))
}, { deep: true })

const filteredTodos = computed(() => {
  if (currentFilter.value === 'active') return todos.value.filter(t => !t.done)
  if (currentFilter.value === 'completed') return todos.value.filter(t => t.done)
  return todos.value
})

const hasCompleted = computed(() => todos.value.some(t => t.done))
const counterText = computed(() => {
  const total = todos.value.length
  const active = todos.value.filter(t => !t.done).length
  const completed = todos.value.filter(t => t.done).length
  return `Всего ${total} · Активно ${active} · Выполнено ${completed}`
})


// Счётчик задач в заголовке вкладки (фича от pi.dev)
watch(filteredTodos, (newVal) => {
  const count = newVal.length
  document.title = count > 0 ? `(${count}) Todo List` : 'Todo List'
}, { immediate: true })

function addTodo() {
  const text = newTodoText.value.trim()
  if (text) {
    todos.value.unshift({ id: Date.now(), text, done: false })
    newTodoText.value = ''
  }
}

function toggleTodo(id) {
  const todo = todos.value.find(t => t.id === id)
  if (todo) todo.done = !todo.done
}

function removeTodo(id) {
  todos.value = todos.value.filter(t => t.id !== id)
}

function setFilter(filter) {
  currentFilter.value = filter
}

function clearCompleted() {
  todos.value = todos.value.filter(t => !t.done)
}

function filterClass(filter) {
  const base = 'px-3 py-1 rounded-full transition font-medium'
  return currentFilter.value === filter
    ? `${base} bg-blue-100 text-blue-600`
    : `${base} text-gray-600 hover:bg-gray-200`
}
</script>

<template>
  <div class="max-w-lg mx-auto px-4">
    <h1 class="text-3xl font-bold text-center text-gray-800 mb-8">📝 Todo List</h1>
   <p class="text-center text-gray-500 mb-6">{{ counterText }} 🎯</p>
    <form @submit.prevent="addTodo" class="flex gap-2 mb-6">
      <input
        v-model="newTodoText"
        type="text"
        placeholder="Новая задача..."
        class="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        autocomplete="off"
      >
      <button
        type="submit"
        class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
      >
        Добавить
      </button>
    </form>

    <div class="flex flex-wrap items-center justify-between gap-4 mb-6 text-sm">
      <div class="flex gap-2">
        <button @click="setFilter('all')" :class="filterClass('all')">Все</button>
        <button @click="setFilter('active')" :class="filterClass('active')">Активные</button>
        <button @click="setFilter('completed')" :class="filterClass('completed')">Готово</button>
      </div>
      <button
        v-if="hasCompleted"
        @click="clearCompleted"
        class="text-red-500 hover:text-red-700 transition font-medium"
      >
        Очистить выполненные
      </button>
    </div>

    <ul class="space-y-3">
      <li
        v-for="todo in filteredTodos"
        :key="todo.id"
        class="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm"
      >
        <input
          type="checkbox"
          :checked="todo.done"
          @change="toggleTodo(todo.id)"
          class="w-5 h-5 rounded accent-green-500 cursor-pointer"
        >
        <span :class="['flex-1', todo.done ? 'line-through text-gray-400' : 'text-gray-700']">
          {{ todo.text }}
        </span>
        <button
          @click="removeTodo(todo.id)"
          class="text-red-400 hover:text-red-600 transition text-lg"
          title="Удалить"
        >
          ✕
        </button>
      </li>
    </ul>

    <p v-if="filteredTodos.length === 0" class="text-center text-gray-400 mt-8">
      {{ todos.length === 0 ? 'Нет задач. Добавьте первую!' : 'Нет задач по выбранному фильтру.' }}
    </p>
  </div>
</template>