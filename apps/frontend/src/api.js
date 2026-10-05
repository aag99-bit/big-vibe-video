const API_BASE = '/api'

// ===== УТИЛИТЫ =====

// Получаем токен из localStorage
const getToken = () => localStorage.getItem('token')

// Базовая функция для всех запросов
async function apiRequest(endpoint, options = {}) {
  const token = getToken()
  
  // Собираем заголовки
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  
  // Если есть токен, добавляем его
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    })
    
    // 401 на защищённом endpoint (НЕ на /auth/*) = истёк токен
    if (response.status === 401 && !endpoint.startsWith('/auth')) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      throw new Error('Token expired')
    }
    
    // Если другая ошибка
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error || 'Request failed')
    }
    
    return await response.json()
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// ===== AUTH API =====

export const authAPI = {
  register: (email, password) => 
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
  
  login: (email, password) => 
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
  
  logout: () => {
    // Просто удаляем токен локально (JWT stateless)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return Promise.resolve({ ok: true })
  },
  
  getProfile: () => apiRequest('/user/profile'),
  
  updateProfile: (email) => 
    apiRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify({ email })
    }),
  
  resetPassword: (email, newPassword) => 
    apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword })
    })
}

// ===== TODOS API =====

export async function fetchTodos(filter = 'all') {
  const endpoint = filter === 'all' ? '/todos' : `/todos?filter=${filter}`
  return apiRequest(endpoint)
}

export async function createTodo(text) {
  return apiRequest('/todos', {
    method: 'POST',
    body: JSON.stringify({ text })
  })
}

export async function updateTodo(id, updates) {
  return apiRequest(`/todos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  })
}

export async function deleteTodo(id) {
  return apiRequest(`/todos/${id}`, {
    method: 'DELETE'
  })
}
// ===== ЭКСПОРТ ОБЪЁКТА ДЛЯ TodoList.vue =====
export const todosAPI = {
  getAll: fetchTodos,
  create: createTodo,
  update: updateTodo,
  delete: deleteTodo
}