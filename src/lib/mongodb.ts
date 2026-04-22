import axios from 'axios';

const API_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Optional: window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: { name: string; email: string; password: string }) => 
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => 
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

export const usersAPI = {
  getAll: () => api.get('/users'),
  getUser: (id: string) => api.get(`/users/${id}`),
  updateUser: (id: string, data: any) => api.put(`/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/users/${id}`)
};

export const productsAPI = {
  getProducts: (params?: any) => api.get('/products', { params }),
  getProduct: (id: string) => api.get(`/products/${id}`),
  createProduct: (data: any) => api.post('/products', data),
  updateProduct: (id: string, data: any) => api.put(`/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  getUserProducts: (userId: string) => api.get(`/products/user/${userId}`)
};

export const commentsAPI = {
  getComments: (productId: string) => api.get(`/comments/product/${productId}`),
  createComment: (data: { productId: string; content: string }) => 
    api.post('/comments', data),
  deleteComment: (id: string) => api.delete(`/comments/${id}`)
};

export const reportsAPI = {
  createReport: (data: any) => api.post('/reports', data),
  getReports: () => api.get('/reports'),
  updateReport: (id: string, data: any) => api.put(`/reports/${id}`, data)
};

export const reviewsAPI = {
  getReviews: (sellerId: string) => api.get(`/reviews/seller/${sellerId}`),
  createReview: (data: { sellerId: string; rating: number; feedback?: string }) => 
    api.post('/reviews', data)
};

export default api;