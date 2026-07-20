import { Platform } from 'react-native';

const getCurrentWebOrigin = (): string | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return window.location.origin;
};

export const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  '989142614977-nm1oruk3p0ueo5mek2su1933d70n2fcc.apps.googleusercontent.com';

export const GOOGLE_ANDROID_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
  '989142614977-90j59tol2ddd0fllsotvn9r28579nh89.apps.googleusercontent.com';

// This URL must exactly match an authorized redirect URI of the Google web
// OAuth client. Give the explicit environment value priority over the browser
// origin: Expo may be served from a LAN/IP address while Google is configured
// for the local web callback.
export const GOOGLE_REDIRECT_URI =
  Platform.OS === 'web'
    ? process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI || getCurrentWebOrigin() || 'http://localhost:8082'
    : undefined;
