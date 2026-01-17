import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token'); // Tem que ser o mesmo nome salvo no Login
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // O FastAPI exige o prefixo "Bearer "
  }
  return config;
});

export default api;