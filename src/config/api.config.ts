import { Platform } from 'react-native';

const rawBaseUrl = (
  Platform.OS === 'web'
    ? process.env.EXPO_PUBLIC_WEB_API_URL || process.env.EXPO_PUBLIC_API_URL
    : process.env.EXPO_PUBLIC_API_URL
) || 'http://localhost:8000/api/v1';
const normalizedBaseUrl = rawBaseUrl.endsWith('/api/v1')
  ? rawBaseUrl
  : `${rawBaseUrl.replace(/\/$/, '')}/api/v1`;

export const API_CONFIG = {
  BASE_URL: normalizedBaseUrl,
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
  AI: {
    GENERATE: '/ai/generate',
    AGENTS: '/ai/agents',
  },
} as const;
