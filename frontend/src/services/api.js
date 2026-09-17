import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => Promise.reject(error))

export const auth = {
  registro: (datos) => api.post('/auth/registro', datos),
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
}

export const profesionales = {
  buscar: (params) => api.get('/profesionales/buscar', { params }),
  obtener: (id) => api.get(`/profesionales/${id}`),
  servicios: () => api.get('/profesionales/servicios'),
  agregarServicio: (id, servicioId) => api.post(`/profesionales/${id}/servicios`, { servicioId }),
}

export const matches = {
  crear: (profesionalId) => api.post('/matches', { profesionalId }),
  obtener: () => api.get('/matches'),
  actualizar: (matchId, accion) => api.patch(`/matches/${matchId}`, { accion }),
  obtenerContacto: (usuarioId) => api.get(`/matches/${usuarioId}/contacto`),
}

export const resenas = {
  crear: (profesionalId, puntuacion, comentario) =>
    api.post('/resenas', { profesionalId, puntuacion, comentario }),
  obtener: (profesionalId, params) =>
    api.get(`/resenas/profesional/${profesionalId}`, { params }),
}

export default api
