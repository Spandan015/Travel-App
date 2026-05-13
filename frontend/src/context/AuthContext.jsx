import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem('nt_token'));
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const stored = localStorage.getItem('nt_user');
    if (token && stored) {
      try { setUser(JSON.parse(stored)); } catch { clearSession(); }
    }
    setLoading(false);
  }, []);

  const saveSession = (token, user) => {
    localStorage.setItem('nt_token', token);
    localStorage.setItem('nt_user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const clearSession = () => {
    localStorage.removeItem('nt_token');
    localStorage.removeItem('nt_user');
    setToken(null);
    setUser(null);
  };

  // ── Update user in state + localStorage after profile edits ──────────────
  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedFields };
      localStorage.setItem('nt_user', JSON.stringify(merged));
      return merged;
    });
  };

  // ── Unified Login ─────────────────────────────────────────────────────────
  const login = async ({ email, password }) => {
    const { data } = await axios.post(`${API}/auth/login`, { email, password });
    saveSession(data.token, data.user);
    return data;
  };

  // ── User Registration (OTP flow) ─────────────────────────────────────────
  const sendRegistrationOTP = async (payload) => {
    const { data } = await axios.post(`${API}/auth/register/send-otp`, payload);
    return data;
  };

  const verifyRegistrationOTP = async (payload) => {
    const { data } = await axios.post(`${API}/auth/register/verify-otp`, payload);
    saveSession(data.token, data.user);
    return data;
  };

  // ── Admin Registration ────────────────────────────────────────────────────
  const sendAdminRegistrationOTP = async (payload) => {
    const { data } = await axios.post(`${API}/auth/register-admin/send-otp`, payload);
    return data;
  };

  const verifyAdminRegistrationOTP = async (payload) => {
    const { data } = await axios.post(`${API}/auth/register-admin/verify-otp`, payload);
    saveSession(data.token, data.user);
    return data;
  };

  // ── Guide Registration ────────────────────────────────────────────────────
  const sendGuideRegistrationOTP = async (payload) => {
    const { data } = await axios.post(`${API}/auth/register-guide/send-otp`, payload);
    return data;
  };

  const verifyGuideRegistrationOTP = async (payload) => {
    const { data } = await axios.post(`${API}/auth/register-guide/verify-otp`, payload);
    return data;
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = () => clearSession();

  // ── Axios auth header ─────────────────────────────────────────────────────
  axios.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : '';

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'admin';
  const isGuide = user?.role === 'guide';
  const isUser  = user?.role === 'user';

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      isAuthenticated, isAdmin, isGuide, isUser,
      login, logout, updateUser,
      sendRegistrationOTP, verifyRegistrationOTP,
      sendAdminRegistrationOTP, verifyAdminRegistrationOTP,
      sendGuideRegistrationOTP, verifyGuideRegistrationOTP,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export default AuthContext;
export { AuthContext };
