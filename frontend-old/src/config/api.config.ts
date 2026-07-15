export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    GOOGLE: '/auth/google',
  },
  TEACHER: {
    ME: '/enseignants/me',
    REGISTER: '/enseignants/register',
  },
} as const;
