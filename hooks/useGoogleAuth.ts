import { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import {
  GoogleSignin,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';

import {
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID,
  GOOGLE_REDIRECT_URI,
} from '../src/config/googleAuth.config';

// Google returns to a separate popup/tab on web. Complete its OAuth session
// immediately when the return page loads. Expo's embedded dev frame is skipped
// because it can be cross-origin with its parent.
if (
  Platform.OS === 'web' &&
  typeof window !== 'undefined' &&
  window.self === window.top
) {
  try {
    WebBrowser.maybeCompleteAuthSession({ skipRedirectCheck: true });
  } catch {
    // A stale session must never block the login screen.
  }
}

type NativeGoogleAuthResult = {
  type: 'success' | 'cancel';
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
  const [webRequest, webResponse, webPromptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    redirectUri: GOOGLE_REDIRECT_URI,
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    if (Platform.OS !== 'web') {
      GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        offlineAccess: false,
        scopes: ['profile', 'email'],
      });
    }
  }, []);

  const promptAsync = useCallback(async () => {
    if (Platform.OS === 'web') {
      return webPromptAsync();
    }

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
  }, [webPromptAsync]);

  return {
    request: Platform.OS === 'web' ? webRequest : {},
    response: Platform.OS === 'web' ? webResponse : null,
    promptAsync,
  };
};
