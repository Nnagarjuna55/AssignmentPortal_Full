import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // ensure API has token if present
    const t = localStorage.getItem('token');
    if (t) API.defaults.headers.common['Authorization'] = 'Bearer ' + t;
  }, []);

  const login = ({ token, role, name }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ role, name }));
    API.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    setToken(token);
    setUser({ role, name });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete API.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
