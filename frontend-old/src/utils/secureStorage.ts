import * as SecureStore from 'expo-secure-store';
import type { User } from '../types/auth.types';

const KEYS = {
  AUTH_TOKEN: 'auth_token',
  FIREBASE_UID: 'firebase_uid',
  USER_DATA: 'user_data',
} as const;

export class SecureStorage {
  static async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.AUTH_TOKEN, token);
  }

  static async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(KEYS.AUTH_TOKEN);
  }

  static async removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync(KEYS.AUTH_TOKEN);
  }

  static async setUser(user: User): Promise<void> {
    await SecureStore.setItemAsync(KEYS.USER_DATA, JSON.stringify(user));
  }

  static async getUser(): Promise<User | null> {
    const data = await SecureStore.getItemAsync(KEYS.USER_DATA);
    if (!data) return null;
    try {
      return JSON.parse(data) as User;
    } catch {
      return null;
    }
  }

  static async removeUser(): Promise<void> {
    await SecureStore.deleteItemAsync(KEYS.USER_DATA);
  }

  static async setFirebaseUid(uid: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.FIREBASE_UID, uid);
  }

  static async getFirebaseUid(): Promise<string | null> {
    return await SecureStore.getItemAsync(KEYS.FIREBASE_UID);
  }

  static async removeFirebaseUid(): Promise<void> {
    await SecureStore.deleteItemAsync(KEYS.FIREBASE_UID);
  }

  static async clearAll(): Promise<void> {
    await Promise.all([
      this.removeToken(),
      this.removeUser(),
      this.removeFirebaseUid(),
    ]);
  }
}
