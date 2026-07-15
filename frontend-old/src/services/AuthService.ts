import { apiClient } from './ApiClient';
import { API_ENDPOINTS } from '../config/api.config';
import { auth, googleProvider } from '../config/firebase.config';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import type {
  AuthResponse,
  LoginCredentials,
  TeacherProfileResponse,
  RegisterTeacherData,
  RegisterTeacherResponse,
} from '../types/auth.types';
import { SecureStorage } from '../utils/secureStorage';

export class AuthService {
  static async signInWithGoogle(): Promise<string> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential?.idToken) {
        throw new Error('Token Firebase non recupere');
      }
      return credential.idToken;
    } catch (error) {
      console.error('Erreur Firebase:', error);
      throw error;
    }
  }

  static async authenticateWithBackend(idToken: string): Promise<AuthResponse> {
    const credentials: LoginCredentials = { id_token: idToken };
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.GOOGLE,
      credentials
    );
    return response.data;
  }

  static async getTeacherProfile(): Promise<TeacherProfileResponse> {
    const response = await apiClient.get<TeacherProfileResponse>(
      API_ENDPOINTS.TEACHER.ME
    );
    return response.data;
  }

  static async registerTeacher(
    data: RegisterTeacherData
  ): Promise<RegisterTeacherResponse> {
    const response = await apiClient.post<RegisterTeacherResponse>(
      API_ENDPOINTS.TEACHER.REGISTER,
      data
    );
    return response.data;
  }

  static async logout(): Promise<void> {
    await SecureStorage.removeToken();
    await SecureStorage.removeUser();
    await signOut(auth);
  }

  static async hasStoredToken(): Promise<boolean> {
    const token = await SecureStorage.getToken();
    return token !== null;
  }
}
