<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white shadow rounded-lg p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Мои задачи</h1>
        
        <!-- Форма добавления -->
        <form @submit.prevent="addTodo" class="mb-6">
          <div class="flex gap-2">
            <input
              v-model="newTodo"
              type="text"
              placeholder="Что нужно сделать?"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              :disabled="!newTodo.trim()"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Добавить
            </button>
          </div>
        </form>

        <!-- Фильтры -->
        <div class="flex gap-2 mb-6">
          <button
            v-for="filter in filters"
            :key="filter.key"
            @click="currentFilter = filter.key"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              currentFilter === filter.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ filter.label }}
          </button>
        </div>

        <!-- Список задач -->
        <div class="space-y-2">
          <div
            v-for="todo in filteredTodos"
            :key="todo.id"
            class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <input
              type="checkbox"
              :checked="todo.done"
              @change="toggleTodo(todo)"
              class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            
            <span
              v-if="editingId !== todo.id"
              @dblclick="startEdit(todo)"
              :class="[
                'flex-1 cursor-pointer',
                todo.done ? 'line-through text-gray-500' : 'text-gray-900'
              ]"
            >
              {{ todo.text }}
            </span>
            
            <input
              v-else
              v-model="editText"
              @blur="saveEdit(todo)"
              @keyup.enter="saveEdit(todo)"
              @keyup.esc="cancelEdit"
              type="text"
              class="flex-1 px-2 py-1 border border-blue-500 rounded focus:outline-none"
              ref="editInput"
            />
            
            <button
              @click="deleteTodo(todo.id)"
              class="text-red-600 hover:text-red-800 text-sm"
            >
              Удалить
            </button>
          </div>
          
          <div v-if="filteredTodos.length === 0" class="text-center py-8 text-gray-500">
            Нет задач
          </div>
        </div>

        <!-- Статистика -->
        <div class="mt-6 pt-6 border-t border-gray-200">
          <div class="flex justify-between text-sm text-gray-600">
            <span>Всего: {{ todos.length }}</span>
            <span>Активных: {{ activeCount }}</span>
            <span>Выполнено: {{ doneCount }}</span>
          </div>
        </div>

        <!-- Кнопка очистки -->
        <button
          v-if="doneCount > 0"
          @click="clearCompleted"
          class="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
        >
          Очистить выполненные ({{ doneCount }})
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { todosAPI } from '../api.js'

const todos = ref([])
const newTodo = ref('')
const currentFilter = ref('all')
const editingId = ref(null)
const editText = ref('')

const filters = [
  { key: 'all', label: 'Все' },
  { key: 'active', label: 'Активные' },
  { key: 'done', label: 'Выполненные' }
]

const activeCount = computed(() => todos.value.filter(t => !t.done).length)
const doneCount = computed(() => todos.value.filter(t => t.done).length)

const filteredTodos = computed(() => {
  if (currentFilter.value === 'active') return todos.value.filter(t => !t.done)
  if (currentFilter.value === 'done') return todos.value.filter(t => t.done)
  return todos.value
})

async function loadTodos() {
  try {
    todos.value = await todosAPI.getAll()
  } catch (error) {
    console.error('Failed to load todos:', error)
  }
}

async function addTodo() {
  if (!newTodo.value.trim()) return
  
  try {
    await todosAPI.create(newTodo.value.trim())
    newTodo.value = ''
    await loadTodos()
  } catch (error) {
    console.error('Failed to add todo:', error)
  }
}

async function toggleTodo(todo) {
  try {
    await todosAPI.update(todo.id, { done: !todo.done })
    await loadTodos()
  } catch (error) {
    console.error('Failed to toggle todo:', error)
  }
}

async function deleteTodo(id) {
  try {
    await todosAPI.delete(id)
    await loadTodos()
  } catch (error) {
    console.error('Failed to delete todo:', error)
  }
}

function startEdit(todo) {
  editingId.value = todo.id
  editText.value = todo.text
  
  nextTick(() => {
    const input = document.querySelector('input.flex-1.px-2.py-1')
    if (input) input.focus()
  })
}

async function saveEdit(todo) {
  if (editingId.value === null) return
  
  const trimmedText = editText.value.trim()
  
  if (trimmedText && trimmedText !== todo.text) {
    try {
      await todosAPI.update(todo.id, { text: trimmedText })
      await loadTodos()
    } catch (error) {
      console.error('Failed to save edit:', error)
    }
  }
  
  editingId.value = null
  editText.value = ''
}

function cancelEdit() {
  editingId.value = null
  editText.value = ''
}

async function clearCompleted() {
  const completedTodos = todos.value.filter(t => t.done)
  
  try {
    for (const todo of completedTodos) {
      await todosAPI.delete(todo.id)
    }
    await loadTodos()
  } catch (error) {
    console.error('Failed to clear completed:', error)
  }
}

onMounted(() => {
  loadTodos()
})
</script>