import { apiClient } from './ApiClient';
import type { ClassesResponse, ClassResponse } from '../types/class.types';

export class ClassService {
  static async getClasses(): Promise<ClassesResponse> {
    const response = await apiClient.get<ClassesResponse>('/classes');
    return response.data;
  }

  static async getClass(id: number): Promise<ClassResponse> {
    const response = await apiClient.get<ClassResponse>(`/classes/${id}`);
    return response.data;
  }

  static async createClass(name: string): Promise<ClassResponse> {
    const response = await apiClient.post<ClassResponse>('/classes', { name });
    return response.data;
  }

  static async createCourse(classId: number, name: string): Promise<any> {
    const response = await apiClient.post<any>(`/classes/${classId}/courses`, { name });
    return response.data;
  }
}
