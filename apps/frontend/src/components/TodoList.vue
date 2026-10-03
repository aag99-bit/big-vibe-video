<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { fetchTodos, createTodo, updateTodo, deleteTodo } from '../api.js'

const todos = ref([])
const newTodo = ref('')
const currentFilter = ref('all')
const editingId = ref(null)
const editText = ref('')

// Счетчики
const totalTodos = ref(0)
const activeTodos = ref(0)
const doneTodos = ref(0)

// Массив для кнопок фильтров (чтобы работал v-for)
const filters = [
  { key: 'all', label: 'Все' },
  { key: 'active', label: 'Активные' },
  { key: 'done', label: 'Выполненные' }
]

async function loadTodos() {
  // Запрашиваем с сервера только нужный фильтр
  todos.value = await fetchTodos(currentFilter.value)
}

async function loadStats() {
  // Для счетчиков всегда запрашиваем все задачи
  const all = await fetchTodos('all')
  totalTodos.value = all.length
  activeTodos.value = all.filter(t => !t.done).length
  doneTodos.value = all.filter(t => t.done).length
}

async function add() {
  const text = newTodo.value.trim()
  if (!text) return
  try {
    const created = await createTodo(text)
    todos.value.push(created)
    newTodo.value = ''
    loadStats() 
  } catch (e) {
    console.error('Add error:', e)
  }
}

async function toggle(todo) {
  const updated = await updateTodo(todo.id, { done: !todo.done })
  const idx = todos.value.findIndex(t => t.id === todo.id)
  if (idx !== -1) {
    todos.value[idx] = updated
    loadStats() 
  }
}

async function remove(todo) {
  await deleteTodo(todo.id)
  todos.value = todos.value.filter(t => t.id !== todo.id)
  loadStats() 
}

function startEdit(todo) {
  editingId.value = todo.id
  editText.value = todo.text
  
  nextTick(() => {
    const input = document.querySelector('input.flex-1.px-2.py-1.border.border-blue-500')
    if (input) input.focus()
  })
}

async function saveEdit(todo) {
  if (editingId.value === null) return
  const trimmedText = editText.value.trim()
  
  if (trimmedText && trimmedText !== todo.text) {
    try {
      const updated = await updateTodo(todo.id, { text: trimmedText })
      const idx = todos.value.findIndex(t => t.id === todo.id)
      if (idx !== -1) {
        todos.value[idx] = updated
      }
    } catch (e) {
      console.error('Save edit error:', e)
    }
  }
  
  editingId.value = null
  editText.value = ''
}

function cancelEdit() {
  editingId.value = null
  editText.value = ''
}

// Переключение фильтра
function setFilter(key) {
  currentFilter.value = key
  loadTodos()
}

// Очистка выполненных (проходимся и удаляем каждую)
async function clearDone() {
  if (!confirm('Удалить все выполненные задачи?')) return
  const doneIds = todos.value.filter(t => t.done).map(t => t.id)
  
  for (const id of doneIds) {
    await deleteTodo(id)
  }
  
  // Если мы были в фильтре "Выполненные", список станет пустым
  todos.value = todos.value.filter(t => !t.done)
  loadStats()
}

onMounted(() => {
  loadTodos()
  loadStats()
})
</script>

<template>
  <div class="max-w-xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-4 text-gray-800 text-center">📝 Todo List</h1>

    <!-- ИСПРАВЛЕНО: используем правильные имена переменных из скрипта -->
    <p class="text-center text-gray-500 mb-6">
      Всего {{ totalTodos }} · Активно {{ activeTodos }} · Выполнено {{ doneTodos }}
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
        <!-- ИСПРАВЛЕНО: используем setFilter и currentFilter -->
        <button
          v-for="f in filters"
          :key="f.key"
          @click="setFilter(f.key)"
          class="px-3 py-1 rounded-full transition"
          :class="currentFilter === f.key
            ? 'bg-blue-600 text-white font-medium'
            : 'text-gray-600 hover:bg-gray-200'"
        >
          {{ f.label }} 
          <span class="text-xs opacity-75">
            {{ f.key === 'all' ? totalTodos : (f.key === 'active' ? activeTodos : doneTodos) }}
          </span>
        </button>
      </div>
      
      <button
        v-if="doneTodos > 0"
        @click="clearDone"
        class="text-sm text-red-500 hover:text-red-700 transition"
      >
        Очистить выполненные
      </button>
    </div>

    <!-- ИСПРАВЛЕНО: используем просто todos, так как фильтрация уже пришла с сервера -->
    <ul v-if="todos.length > 0" class="space-y-2">
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
        <span 
          v-if="editingId !== todo.id"
          :class="{ 'line-through text-gray-500': todo.done }" 
          class="flex-1 cursor-pointer"
          @dblclick="startEdit(todo)"
        >
          {{ todo.text }}
        </span>
        <input
          v-else
          v-model="editText"
          class="flex-1 px-2 py-1 border border-blue-500 rounded focus:outline-none"
          @blur="saveEdit(todo)"
          @keyup.enter="saveEdit(todo)"
          @keyup.esc="cancelEdit"
          ref="editInput"
        />
        <button
          @click="remove(todo)"
          class="text-red-600 hover:text-red-800"
        >
          ✕
        </button>
      </li>
    </ul>

    <p v-if="todos.length === 0" class="text-center text-gray-500 py-8">
      В этом фильтре ничего нет
    </p>

    <p class="mt-6 text-xs text-gray-400 text-center">
      Данные хранятся на сервере (SQLite) и общие для всех
    </p>
  </div>
</template>