import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('weathex_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const searchWeather = async (query) => {
  const response = await api.get('/weather/current', { params: { query } })
  return response.data
}

export const getForecast = async (lat, lon) => {
  const response = await api.get('/weather/forecast', { params: { lat, lon } })
  return response.data
}

export const getAirQuality = async (lat, lon) => {
  const response = await api.get('/weather/air-quality', { params: { lat, lon } })
  return response.data
}

export const getHistory = async () => {
  const response = await api.get('/history/')
  return response.data
}

export const getHistoryById = async (id) => {
  const response = await api.get(`/history/${id}`)
  return response.data
}

export const createHistory = async (data) => {
  const response = await api.post('/history/', data)
  return response.data
}

export const updateHistory = async (id, data) => {
  const response = await api.put(`/history/${id}`, data)
  return response.data
}

export const deleteHistory = async (id) => {
  const response = await api.delete(`/history/${id}`)
  return response.data
}

export const exportHistory = async (id, format) => {
  const response = await api.get(`/export/${id}`, {
    params: { format },
    responseType: 'blob',
  })
  return response.data
}

export const getCurrentLocationWeather = async (lat, lon) => {
  const response = await api.get('/weather/current', { params: { lat, lon } })
  return response.data
}

export const searchLocations = async (query) => {
  const response = await api.get('/weather/search', { params: { query } })
  return response.data
}

export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password })
  return response.data
}

export const registerUser = async (email, password, fullName) => {
  const response = await api.post('/auth/register', { email, password, full_name: fullName })
  return response.data
}

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me')
  return response.data
}