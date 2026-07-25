import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI, adminAPI, feedbackAPI } from '../services/api';

const STORAGE_KEY = 'plantguard_user';
const TOKEN_KEY = 'plantguard_token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        try {
          const response = await authAPI.getCurrentUser();
          setUserState(response.user);
        } catch (error) {
          console.error('Failed to load user:', error);
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const setUser = (data) => {
    setUserState(data);
    if (data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      localStorage.setItem(TOKEN_KEY, response.token);
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      const response = await authAPI.signup(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const response = await authAPI.verifyOTP(email, otp);
      localStorage.setItem(TOKEN_KEY, response.token);
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const resendOTP = async (email) => {
    try {
      const response = await authAPI.resendOTP(email);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const forgotPassword = async (email) => {
    const response = await authAPI.forgotPassword(email);
    return response;
  };

  const resendForgotPasswordOTP = async (email) => {
    const response = await authAPI.resendForgotPasswordOTP(email);
    return response;
  };

  const resetPassword = async (data) => {
    const response = await authAPI.resetPassword(data);
    return response;
  };

  const updateProfile = async (updates) => {
    try {
      const response = await userAPI.updateProfile(updates);
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const changePassword = async (passwords) => {
    try {
      const response = await userAPI.changePassword(passwords);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const addAnalysis = async (result) => {
    try {
      // Analysis is saved automatically by backend when analyze endpoint is called
      // Just refresh user data
      const response = await userAPI.getProfile();
      setUser(response.user);
    } catch (error) {
      console.error('Failed to refresh user after analysis:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(STORAGE_KEY);
    setUserState(null);
  };

  const getAllUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      return response.users || [];
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return [];
    }
  };

  const getAllDetections = async () => {
    try {
      const response = await adminAPI.getDetections();
      return response.detections || [];
    } catch (error) {
      console.error('Failed to fetch detections:', error);
      return [];
    }
  };

  const submitFeedback = async (feedbackData) => {
    const response = await feedbackAPI.submit(feedbackData);
    return response;
  };

  const getMyFeedback = async () => {
    try {
      const response = await feedbackAPI.getMine();
      return response.feedback || [];
    } catch (error) {
      console.error('Failed to fetch user feedback:', error);
      return [];
    }
  };

  const getAllFeedback = async () => {
    try {
      const response = await adminAPI.getFeedback();
      return response.feedback || [];
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
      return [];
    }
  };

  const getAdminStats = async () => {
    try {
      return await adminAPI.getStats();
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
      return null;
    }
  };

  const getAllAnalyses = async () => {
    try {
      const response = await adminAPI.getAnalyses();
      return response.analyses || [];
    } catch (error) {
      console.error('Failed to fetch analyses:', error);
      return [];
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        login,
        signup,
        verifyOTP,
        resendOTP,
        forgotPassword,
        resendForgotPasswordOTP,
        resetPassword,
        registerUser: signup,
        updateProfile,
        changePassword,
        addAnalysis,
        getAllUsers,
        getAllDetections,
        submitFeedback,
        getMyFeedback,
        getAllFeedback,
        getAdminStats,
        getAllAnalyses,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
