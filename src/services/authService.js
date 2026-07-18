import api from './api';

const authService = {
  login: async (email, password, deviceId, rememberDevice) => {
    const response = await api.post('/auth/login', { email, password, deviceId, rememberDevice });
    return response.data;
  },

  verifyDevice: async (tempToken, code, deviceId, rememberDevice) => {
    const response = await api.post('/auth/verify-device', { tempToken, code, deviceId, rememberDevice });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  googleLogin: async (credential) => {
    const response = await api.post('/auth/google', { credential });
    return response.data;
  },

  getUsersList: async () => {
    const response = await api.get('/auth/users');
    return response.data;
  },

  unlockUser: async (userId) => {
    const response = await api.post('/auth/unlock', { userId });
    return response.data;
  },

  toggleUserRole: async (userId, role = null) => {
    const response = await api.post('/auth/toggle-role', { userId, role });
    return response.data;
  },

  extendSuspension: async (userId) => {
    const response = await api.post('/auth/extend-suspension', { userId });
    return response.data;
  },

  banUser: async (userId) => {
    const response = await api.post('/auth/ban', { userId });
    return response.data;
  }
};

export default authService;
