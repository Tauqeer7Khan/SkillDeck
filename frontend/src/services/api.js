import axios from 'axios';

// Create base API instance
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Handle 403 Forbidden - insufficient permissions
    if (error.response?.status === 403) {
      console.error('Access forbidden - insufficient permissions');
    }
    
    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error('Server error - please try again later');
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = api;

// Questions API
export const questionsAPI = {
  // Get all questions with filters
  getQuestions: (params = {}) => api.get('/questions', { params }),
  
  // Get single question
  getQuestion: (id) => api.get(`/questions/${id}`),
  
  // Get questions by category
  getQuestionsByCategory: (category, params = {}) => 
    api.get(`/questions/category/${category}`, { params }),
  
  // Get random practice question
  getRandomQuestion: (params = {}) => 
    api.get('/questions/random/practice', { params }),
  
  // Validate solution
  validateSolution: (id, data) => 
    api.post(`/questions/${id}/validate`, data),
};

// Progress API
export const progressAPI = {
  // Submit progress
  submitProgress: (data) => api.post('/progress/submit', data),
  
  // Get progress overview
  getOverview: () => api.get('/progress/overview'),
  
  // Get recent activity
  getActivity: (params = {}) => api.get('/progress/activity', { params }),
  
  // Get question progress
  getQuestionProgress: (questionId) => 
    api.get(`/progress/question/${questionId}`),
};

// Admin API
export const adminAPI = {
  // Get dashboard stats
  getDashboard: () => api.get('/admin/dashboard'),
  
  // Question management
  createQuestion: (data) => api.post('/admin/questions', data),
  updateQuestion: (id, data) => api.put(`/admin/questions/${id}`, data),
  deleteQuestion: (id) => api.delete(`/admin/questions/${id}`),
  
  // User management
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  
  // Analytics
  getAnalytics: (params = {}) => api.get('/admin/analytics', { params }),
};

// Utility functions
export const apiUtils = {
  // Handle API errors consistently
  handleError: (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    console.error('API Error:', error);
    return message;
  },
  
  // Format API response
  formatResponse: (response) => {
    return response.data;
  },
  
  // Check if response is successful
  isSuccess: (response) => {
    return response.data?.success === true;
  },
};

export default api;
