import axios from 'axios'

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
})

// attach token to every request
api.interceptors.request.use((config) => {
  const user = localStorage.getItem('user')
  if (user) {
    const parsed = JSON.parse(user)
    config.headers.Authorization = `Bearer ${parsed.token}`
  }
  return config
})

export default api
