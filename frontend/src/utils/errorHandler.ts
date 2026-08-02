import { AxiosError } from 'axios';

export type ErrorCategory = 'validation' | 'network' | 'firebase' | 'api' | 'unknown';

export interface AppError {
  category: ErrorCategory;
  message: string;
  technicalMessage?: string;
}

export class ErrorHandler {
  static handle(error: unknown): AppError {
    if (error instanceof AxiosError) {
      if (!error.response) {
        return {
          category: 'network',
          message: 'Pas de connexion Internet. Veuillez verifier votre reseau.',
          technicalMessage: error.message,
        };
      }

      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 401:
          return {
            category: 'api',
            message: data?.message || 'Token Google invalide ou expiré. Veuillez réessayer.',
            technicalMessage: 'Token invalide ou expire',
          };
        case 404:
          return {
            category: 'api',
            message: 'Profil enseignant introuvable.',
            technicalMessage: 'Teacher profile not found',
          };
        case 409:
          return {
            category: 'api',
            message: 'Un profil enseignant existe deja.',
            technicalMessage: 'Conflict: teacher already exists',
          };
        case 422:
          // Extraire les messages d'erreur spécifiques de Laravel
          let errorMessage = 'Veuillez verifier les informations saisies.';
          if (data?.errors) {
            const firstErrorKey = Object.keys(data.errors)[0];
            if (firstErrorKey && data.errors[firstErrorKey][0]) {
              errorMessage = data.errors[firstErrorKey][0];
            }
          }
          return {
            category: 'validation',
            message: errorMessage,
            technicalMessage: JSON.stringify(data?.errors),
          };
        case 500:
          return {
            category: 'api',
            message: 'Une erreur est survenue sur le serveur. Veuillez reessayer.',
            technicalMessage: 'Internal server error',
          };
        default:
          return {
            category: 'api',
            message: data?.message || 'Une erreur est survenue.',
            technicalMessage: `HTTP ${status}`,
          };
      }
    }

    if (error instanceof Error && error.message.includes('Firebase')) {
      return {
        category: 'firebase',
        message: 'Erreur de connexion Google. Veuillez reessayer.',
        technicalMessage: error.message,
      };
    }

    if (error instanceof Error && error.message.includes('Network')) {
      return {
        category: 'network',
        message: 'Probleme de connexion. Veuillez verifier votre reseau.',
        technicalMessage: error.message,
      };
    }

    return {
      category: 'unknown',
      message: 'Une erreur inattendue est survenue.',
      technicalMessage: error instanceof Error ? error.message : String(error),
    };
  }
}
