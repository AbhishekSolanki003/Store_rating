import { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('store_rating_user') || 'null'));

  function saveSession(data) {
    localStorage.setItem('store_rating_token', data.token);
    localStorage.setItem('store_rating_user', JSON.stringify(data.user));
    setUser(data.user);
  }

  async function login(values) {
    const { data } = await api.post('/auth/login', values);
    saveSession(data);
  }

  async function register(values) {
    const { data } = await api.post('/auth/register', values);
    saveSession(data);
  }

  function logout() {
    localStorage.removeItem('store_rating_token');
    localStorage.removeItem('store_rating_user');
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
