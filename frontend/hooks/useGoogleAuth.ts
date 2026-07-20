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
  // On web we no longer need expo-auth-session; Firebase signInWithPopup
  // uses the already-registered redirect URI:
  // https://eduassist-prod.firebaseapp.com/__/auth/handler
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
      // Use Firebase signInWithPopup — this redirects through
      // https://eduassist-prod.firebaseapp.com/__/auth/handler
      // which is already registered in Google Cloud Console.
      try {
        const firebaseResult = await signInWithPopup(auth, googleProvider);

        // Extract the Google ID token from the credential — NOT the Firebase
        // ID token.  The backend validates via Google's tokeninfo endpoint,
        // which only accepts Google-issued tokens.
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

    // Android: use @react-native-google-signin
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
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
    // `request` is used in LoginScreen to disable the button until ready.
    // On web it's always ready (Firebase popup needs no pre-loaded request).
    request: Platform.OS === 'web' ? (webReady ? {} : null) : {},
    // `response` was used by expo-auth-session's hook-driven flow.
    // With signInWithPopup the result is returned directly from promptAsync,
    // so this is always null.
    response: null,
    promptAsync,
  };
};

