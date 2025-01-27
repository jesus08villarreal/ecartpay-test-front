import axios from 'axios';

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const enviaApi = axios.create({
  baseURL: process.env.VUE_APP_ENVIA_API_URL,
  headers: {
    'Authorization': `Bearer ${process.env.VUE_APP_ENVIA_TOKEN}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

export default api; 