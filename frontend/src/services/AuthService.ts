import { apiClient } from './ApiClient';
import { API_ENDPOINTS } from '../config/api.config';

import type {
  AuthResponse,
  LoginCredentials,
  TeacherProfileResponse,
  RegisterTeacherData,
  RegisterTeacherResponse,
} from '../types/auth.types';

import { SecureStorage } from '../utils/secureStorage';

export class AuthService {
  /**
   * Connecte Firebase avec le token Google, puis retourne le token Firebase
   * attendu par le backend Laravel.
   */
  static async signInWithGoogleToken(tokens: {
    idToken?: string | null;
    accessToken?: string | null;
  }): Promise<string> {
    // Simply return the Google ID token that the backend will validate
    if (!tokens.idToken) {
      throw new Error('Google authentication failed - no ID token received');
    }
    
    // Validate basic Google ID token format
    if (typeof tokens.idToken !== 'string' || tokens.idToken.length < 50) {
      throw new Error('Invalid Google ID token format received');
    }
    
    return tokens.idToken;
  }

  /**
   * Envoie le token Google/Firebase au backend Laravel
   */
  static async authenticateWithBackend(idToken: string): Promise<AuthResponse> {
    const credentials: LoginCredentials = {
      id_token: idToken,
    };

    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.GOOGLE,
      credentials
    );

    return response.data;
  }

  /**
   * Récupère le profil enseignant pour l'utilisateur authentifié
   */
  static async getTeacherProfile(): Promise<TeacherProfileResponse> {
    const response = await apiClient.get<TeacherProfileResponse>(
      API_ENDPOINTS.TEACHER.ME
    );

    return response.data;
  }

  /**
   * Enregistre un nouveau profil enseignant
   */
  static async registerTeacher(
    data: RegisterTeacherData
  ): Promise<RegisterTeacherResponse> {
    const response = await apiClient.post<RegisterTeacherResponse>(
      API_ENDPOINTS.TEACHER.REGISTER,
      data
    );

    return response.data;
  }

  /**
   * Deconnecte l'utilisateur et supprime les tokens stockes
   */
  static async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.warn('Erreur lors de la deconnexion sur le serveur:', error);
    } finally {
      await SecureStorage.removeToken();
      await SecureStorage.removeUser();
    }
  }

  /**
   * Vérifie si un token d'authentification est stocké
   */
  static async hasStoredToken(): Promise<boolean> {
    const token = await SecureStorage.getToken();
    return token !== null;
  }
}
