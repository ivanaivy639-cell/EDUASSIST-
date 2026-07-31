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

  static async createClass(name: string, level?: string): Promise<ClassResponse> {
    const response = await apiClient.post<ClassResponse>('/classes', { name, level });
    return response.data;
  }

  static async createCourse(classId: number, name: string): Promise<any> {
    const response = await apiClient.post<any>(`/classes/${classId}/courses`, { name });
    return response.data;
  }

  static async updateClass(id: number, name: string, level?: string): Promise<ClassResponse> {
    const response = await apiClient.put<ClassResponse>(`/classes/${id}`, { name, level });
    return response.data;
  }

  static async deleteClass(id: number): Promise<any> {
    const response = await apiClient.delete<any>(`/classes/${id}`);
    return response.data;
  }

  static async updateCourse(classId: number, courseId: number, name: string): Promise<any> {
    const response = await apiClient.put<any>(`/classes/${classId}/courses/${courseId}`, { name });
    return response.data;
  }

  static async deleteCourse(classId: number, courseId: number): Promise<any> {
    const response = await apiClient.delete<any>(`/classes/${classId}/courses/${courseId}`);
    return response.data;
  }

  static async getCourseDetails(classId: number, courseId: number): Promise<any> {
    const response = await apiClient.get<any>(`/classes/${classId}/courses/${courseId}`);
    return response.data;
  }

  static async createChapter(classId: number, courseId: number, title: string): Promise<any> {
    const response = await apiClient.post<any>(`/classes/${classId}/courses/${courseId}/chapters`, { title });
    return response.data;
  }

  static async deleteChapter(classId: number, courseId: number, chapterId: number): Promise<any> {
    const response = await apiClient.delete<any>(`/classes/${classId}/courses/${courseId}/chapters/${chapterId}`);
    return response.data;
  }

  static async createLesson(classId: number, courseId: number, chapterId: number, title: string): Promise<any> {
    const response = await apiClient.post<any>(`/classes/${classId}/courses/${courseId}/chapters/${chapterId}/lessons`, { title });
    return response.data;
  }

  static async deleteLesson(classId: number, courseId: number, chapterId: number, lessonId: number): Promise<any> {
    const response = await apiClient.delete<any>(`/classes/${classId}/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`);
    return response.data;
  }
}
