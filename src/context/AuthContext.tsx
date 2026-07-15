import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AuthService } from '../services/AuthService';
import { SecureStorage } from '../utils/secureStorage';
import { ErrorHandler } from '../utils/errorHandler';
import type { AuthState, AuthStatus, RegisterTeacherData, TeacherProfile, User } from '../types/auth.types';

interface AuthContextType {
  state: AuthState;
  status: AuthStatus;
  login: (tokens: { idToken?: string | null; accessToken?: string | null }) => Promise<boolean>;
  logout: () => Promise<void>;
  checkProfile: () => Promise<boolean>;
  registerTeacher: (data: RegisterTeacherData) => Promise<TeacherProfile>;
  refreshUser: () => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  isCheckingProfile: false,
  hasTeacherProfile: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const [status, setStatus] = useState<AuthStatus>('idle');

  const checkProfile = useCallback(async (): Promise<boolean> => {
    setState((prev) => ({ ...prev, isCheckingProfile: true }));
    setStatus('checkingProfile');
    try {
      const response = await AuthService.getTeacherProfile();
      const hasProfile = response.success && response.data !== undefined;

      setState((prev) => ({
        ...prev,
        hasTeacherProfile: hasProfile,
        isCheckingProfile: false,
      }));

      setStatus(hasProfile ? 'success' : 'error');
      return hasProfile;
    } catch {
      setState((prev) => ({
        ...prev,
        hasTeacherProfile: false,
        isCheckingProfile: false,
      }));
      setStatus('error');
      return false;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async (): Promise<void> => {
      try {
        const token = await SecureStorage.getToken();
        const user = await SecureStorage.getUser();

        if (token && user) {
          setState((prev) => ({
            ...prev,
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          }));
          await checkProfile();
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    void initializeAuth();
  }, [checkProfile]);

  const login = useCallback(async (tokens: { idToken?: string | null; accessToken?: string | null }): Promise<boolean> => {
    setStatus('authenticating');
    try {
      const idToken = await AuthService.signInWithGoogleToken(tokens);
      const authResponse = await AuthService.authenticateWithBackend(idToken);

      if (!authResponse.success) {
        throw new Error(authResponse.message);
      }

      const { user, access_token } = authResponse.data;
      await SecureStorage.setToken(access_token);
      await SecureStorage.setUser(user);

      setState((prev) => ({
        ...prev,
        user,
        token: access_token,
        isAuthenticated: true,
      }));

      setStatus('success');
      return await checkProfile();
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      setStatus('error');
      throw new Error(appError.message);
    }
  }, [checkProfile]);

  const logout = useCallback(async (): Promise<void> => {
    setStatus('loading');
    await AuthService.logout();
    setState(initialState);
    setStatus('idle');
  }, []);

  const registerTeacher = useCallback(async (data: RegisterTeacherData): Promise<TeacherProfile> => {
    setStatus('registeringTeacher');
    try {
      const response = await AuthService.registerTeacher(data);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Impossible de creer le profil enseignant.');
      }

      setState((prev) => ({
        ...prev,
        hasTeacherProfile: true,
      }));
      setStatus('success');

      return response.data;
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      setStatus('error');
      throw new Error(appError.message);
    }
  }, []);

  const refreshUser = useCallback(async (): Promise<void> => {
    const user = await SecureStorage.getUser();
    setState((prev) => ({ ...prev, user }));
  }, []);

  return (
    <AuthContext.Provider value={{ state, status, login, logout, checkProfile, registerTeacher, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit etre utilise dans un AuthProvider');
  }
  return context;
};