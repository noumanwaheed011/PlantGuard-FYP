const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('plantguard_token');
  
  // Check if body is FormData
  const isFormData = options.body instanceof FormData;
  
  // Build headers - always include Authorization if token exists
  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // Add Content-Type only if not FormData (browser sets it automatically for FormData)
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
  };

  // Handle body serialization
  if (isFormData) {
    // FormData - browser will set Content-Type with boundary automatically
    // Authorization header is already included in headers
  } else if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Try to parse JSON only for successful or JSON error responses
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = {};
    }

    if (!response.ok) {
      // Handle token expiration / unauthorized
      if (response.status === 401) {
        localStorage.removeItem('plantguard_token');
        localStorage.removeItem('plantguard_user');
        window.location.href = '/login';
      }
      const err = new Error(data.error || data.message || 'API request failed');
      if (data.code) err.code = data.code;
      throw err;
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    // Network/connection errors (backend not running, CORS, wrong URL)
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error(
        'Cannot reach the server. Please check your internet connection and ensure the backend is running at ' + API_BASE_URL
      );
    }
    if (error.message?.toLowerCase().includes('failed to fetch') || error.message?.toLowerCase().includes('network')) {
      throw new Error(
        'Cannot reach the server. Please check your connection and ensure the backend is running.'
      );
    }
    throw error;
  }
}

// Auth APIs
export const authAPI = {
  signup: (userData) => apiCall('/auth/signup', { method: 'POST', body: userData }),
  login: (credentials) => apiCall('/auth/login', { method: 'POST', body: credentials }),
  verifyOTP: (email, otp) => apiCall('/auth/verify-otp', { method: 'POST', body: { email, otp } }),
  resendOTP: (email) => apiCall('/auth/resend-otp', { method: 'POST', body: { email } }),
  forgotPassword: (email) => apiCall('/auth/forgot-password', { method: 'POST', body: { email } }),
  resendForgotPasswordOTP: (email) => apiCall('/auth/forgot-password/resend', { method: 'POST', body: { email } }),
  resetPassword: (data) => apiCall('/auth/reset-password', { method: 'POST', body: data }),
  getCurrentUser: () => apiCall('/auth/me'),
};

// User APIs
export const userAPI = {
  getProfile: () => apiCall('/user/profile'),
  updateProfile: (updates) => apiCall('/user/profile', { method: 'PUT', body: updates }),
  changePassword: (passwords) => apiCall('/user/password', { method: 'PUT', body: passwords }),
  getAnalyses: () => apiCall('/user/analyses'),
};

// Analysis APIs
export const analysisAPI = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiCall('/analysis/upload', {
      method: 'POST',
      body: formData,
      // No headers needed - apiCall will handle Authorization and Content-Type automatically
    });
  },
  analyzeImage: (imageData) => apiCall('/analysis/analyze', { method: 'POST', body: imageData }),
  getResult: (id) => apiCall(`/analysis/result/${id}`),
};

// Feedback APIs
export const feedbackAPI = {
  submit: (feedbackData) => apiCall('/feedback', { method: 'POST', body: feedbackData }),
  getMine: () => apiCall('/feedback/mine'),
};

// Notification APIs (mock for now)
export const notificationAPI = {
  getNotifications: () => Promise.resolve({ notifications: [] }),
  getUnreadCount: () => Promise.resolve({ unreadCount: 0 }),
  markAsRead: (id) => Promise.resolve({}),
  markAllAsRead: () => Promise.resolve({}),
};

// Admin APIs
export const adminAPI = {
  getUsers: () => apiCall('/admin/users'),
  getDetections: (limit = 100, skip = 0) => apiCall(`/admin/detections?limit=${limit}&skip=${skip}`),
  getFeedback: (limit = 100, skip = 0) => apiCall(`/admin/feedback?limit=${limit}&skip=${skip}`),
  getStats: () => apiCall('/admin/stats'),
  getAnalyses: (limit = 200, skip = 0) => apiCall(`/admin/analyses?limit=${limit}&skip=${skip}`),
};

// Health check
export const healthCheck = () => apiCall('/health');
