import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [selectedAircraft, setSelectedAircraft] = useState(
    JSON.parse(localStorage.getItem('selected_aircraft'))
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set axios default authorization header
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/api/auth/profile/');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (pno, password) => {
    try {
      const response = await axios.post('/api/auth/login/', { pno, password });
      const { user, access, refresh } = response.data;

      setUser(user);
      setToken(access);
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed. Please try again.'
      };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register/', userData);
      const { user, access, refresh } = response.data;

      setUser(user);
      setToken(access);
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.pno?.[0] ||
                       error.response?.data?.error ||
                       'Signup failed. Please try again.';
      return {
        success: false,
        error: errorMsg
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setSelectedAircraft(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('selected_aircraft');
    delete axios.defaults.headers.common['Authorization'];
  };

  const selectAircraft = (aircraft) => {
    setSelectedAircraft(aircraft);
    localStorage.setItem('selected_aircraft', JSON.stringify(aircraft));
  };

  const value = {
    user,
    token,
    selectedAircraft,
    loading,
    login,
    signup,
    logout,
    selectAircraft,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
