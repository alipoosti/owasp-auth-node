import React, { createContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('authToken', token);
      // Optionally fetch user profile here
      authService.getProfile(token)
        .then(profile => setUser(profile))
        .catch(() => {
          setUser(null);
          setToken(null);
          localStorage.removeItem('authToken');
        });
    } else {
      localStorage.removeItem('authToken');
      setUser(null);
    }
  }, [token]);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    console.log('AuthContext logout called');
    setToken(null);
    setUser(null);
    authService.logout();
    console.log('AuthContext logout: token and user cleared');
    console.log('localStorage authToken after logout:', localStorage.getItem('authToken'));
  };

  // New method to set token and user after OAuth login
  const setOAuthToken = (token) => {
    setToken(token);
    // Optionally fetch user profile after OAuth login
    authService.getProfile(token)
      .then(profile => setUser(profile))
      .catch(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('authToken');
      });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, setOAuthToken }}>
      {children}
    </AuthContext.Provider>
  );
};