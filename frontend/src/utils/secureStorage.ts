import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { User } from '../types/auth.types';

const KEYS = {
  AUTH_TOKEN: 'auth_token',
  FIREBASE_UID: 'firebase_uid',
  USER_DATA: 'user_data',
} as const;

export class SecureStorage {
  private static async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
      return;
    }

    await SecureStore.setItemAsync(key, value);
  }

  private static async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return window.localStorage.getItem(key);
    }

    return await SecureStore.getItemAsync(key);
  }

  private static async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
      return;
    }

    await SecureStore.deleteItemAsync(key);
  }

  static async setToken(token: string): Promise<void> {
    await this.setItem(KEYS.AUTH_TOKEN, token);
  }

  static async getToken(): Promise<string | null> {
    return await this.getItem(KEYS.AUTH_TOKEN);
  }

  static async removeToken(): Promise<void> {
    await this.removeItem(KEYS.AUTH_TOKEN);
  }

  static async setUser(user: User): Promise<void> {
    await this.setItem(KEYS.USER_DATA, JSON.stringify(user));
  }

  static async getUser(): Promise<User | null> {
    const data = await this.getItem(KEYS.USER_DATA);
    if (!data) return null;
    try {
      return JSON.parse(data) as User;
    } catch {
      return null;
    }
  }

  static async removeUser(): Promise<void> {
    await this.removeItem(KEYS.USER_DATA);
  }

  static async setFirebaseUid(uid: string): Promise<void> {
    await this.setItem(KEYS.FIREBASE_UID, uid);
  }

  static async getFirebaseUid(): Promise<string | null> {
    return await this.getItem(KEYS.FIREBASE_UID);
  }

  static async removeFirebaseUid(): Promise<void> {
    await this.removeItem(KEYS.FIREBASE_UID);
  }

  static async clearAll(): Promise<void> {
    await Promise.all([
      this.removeToken(),
      this.removeUser(),
      this.removeFirebaseUid(),
    ]);
  }
}
