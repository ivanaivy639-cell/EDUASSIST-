import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import {
  GoogleSignin,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from '../src/config/firebase.config';

import {
  GOOGLE_WEB_CLIENT_ID,
} from '../src/config/googleAuth.config';

type GoogleAuthResultType = 'success' | 'cancel' | 'dismiss' | 'error' | 'locked' | 'opened';

type NativeGoogleAuthResult = {
  type: GoogleAuthResultType;
  authentication?: {
    accessToken?: string | null;
    idToken?: string | null;
  };
  params?: {
    access_token?: string;
    id_token?: string;
  };
};

export const useGoogleAuth = () => {
  const [webReady, setWebReady] = useState(Platform.OS === 'web');

  useEffect(() => {
    if (Platform.OS !== 'web') {
      GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        offlineAccess: false,
        scopes: ['profile', 'email'],
      });
    }
  }, []);

  const promptAsync = useCallback(async (): Promise<NativeGoogleAuthResult> => {
    if (Platform.OS === 'web') {
      try {
        const firebaseResult = await signInWithPopup(auth, googleProvider);

        const credential = GoogleAuthProvider.credentialFromResult(firebaseResult);
        const idToken = credential?.idToken;

        if (!idToken) {
          throw new Error('Google authentication succeeded but no ID token was returned.');
        }

        return {
          type: 'success',
          authentication: {
            idToken,
            accessToken: credential?.accessToken ?? null,
          },
          params: {
            id_token: idToken,
          },
        };
      } catch (error: unknown) {
        const firebaseError = error as { code?: string };
        if (firebaseError.code === 'auth/popup-closed-by-user' || firebaseError.code === 'auth/cancelled-popup-request') {
          return { type: 'cancel' };
        }
        throw error;
      }
    }

    // Android/iOS: use @react-native-google-signin
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    // Force account chooser by signing out previous cached sessions
    try {
      await GoogleSignin.signOut();
    } catch (e) {
      // Ignore if not signed in
    }

    const result = await GoogleSignin.signIn();

    if (!isSuccessResponse(result)) {
      return { type: 'cancel' } satisfies NativeGoogleAuthResult;
    }

    if (!result.data.idToken) {
      throw new Error('Google n a retourne aucun jeton d identite.');
    }

    return {
      type: 'success',
      authentication: {
        idToken: result.data.idToken,
      },
      params: {
        id_token: result.data.idToken,
      },
    } satisfies NativeGoogleAuthResult;
  }, []);

  return {
    request: Platform.OS === 'web' ? (webReady ? {} : null) : {},
    response: null,
    promptAsync,
  };
};
