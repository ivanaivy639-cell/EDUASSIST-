import { apiClient } from './ApiClient';

import { ApiSuccessResponse } from '../types/api.types';

export class CourseContentService {
  static async getChapters(courseId: number): Promise<ApiSuccessResponse<any[]>> {
    const response = await apiClient.get(`/classes/courses/${courseId}/chapters`);
    return response.data;
  }

  static async createChapter(courseId: number, data: any): Promise<ApiSuccessResponse<any>> {
    const response = await apiClient.post(`/classes/courses/${courseId}/chapters`, data);
    return response.data;
  }

  static async updateChapter(courseId: number, chapterId: number, data: any): Promise<ApiSuccessResponse<any>> {
    const response = await apiClient.put(`/classes/courses/${courseId}/chapters/${chapterId}`, data);
    return response.data;
  }

  static async deleteChapter(courseId: number, chapterId: number): Promise<ApiSuccessResponse<null>> {
    const response = await apiClient.delete(`/classes/courses/${courseId}/chapters/${chapterId}`);
    return response.data;
  }
}
