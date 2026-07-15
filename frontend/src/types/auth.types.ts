export interface User {
  id: number;
  firebase_uid: string;
  email: string;
  name: string;
  avatar_url: string | null;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    access_token: string;
    token_type: string;
  };
}

export interface AuthErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface LoginCredentials {
  id_token: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isCheckingProfile: boolean;
  hasTeacherProfile: boolean | null;
}

export type AuthStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'error'
  | 'offline'
  | 'authenticating'
  | 'checkingProfile'
  | 'registeringTeacher';

export interface TeacherProfile {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  ecole: string;
  classe: string;
  matiere: string;
}

export interface TeacherProfileResponse {
  success: boolean;
  data?: TeacherProfile;
  message?: string;
}

export interface RegisterTeacherData {
  nom: string;
  prenom: string;
  telephone: string;
  ecole: string;
  classe: string;
  matiere: string;
}

export interface RegisterTeacherResponse {
  success: boolean;
  message: string;
  data?: TeacherProfile;
}
