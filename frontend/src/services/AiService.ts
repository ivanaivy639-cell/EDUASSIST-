import { apiClient } from './ApiClient';
import { API_ENDPOINTS } from '../config/api.config';
import type {
  AiAgentsResponse,
  AiGenerationRequest,
  AiGenerationResponse,
} from '../types/ai.types';

export class AiService {
  static async generateContent(data: AiGenerationRequest): Promise<AiGenerationResponse> {
    const response = await apiClient.post<AiGenerationResponse>(
      API_ENDPOINTS.AI.GENERATE,
      data
    );

    return response.data;
  }

  static async getAgents(): Promise<AiAgentsResponse> {
    const response = await apiClient.get<AiAgentsResponse>(API_ENDPOINTS.AI.AGENTS);
    return response.data;
  }

  // --- Stubs for UI features ---
  static async getConversations(courseId?: string, chapterId?: string, lessonId?: string): Promise<any> {
    return { success: true, data: [] };
  }

  static async getConversation(id: number): Promise<any> {
    return { success: true, data: { messages: [] } };
  }

  static async deleteConversation(id: number): Promise<any> {
    return { success: true };
  }

  static async parseDocument(uri: string, name: string, type: string): Promise<any> {
    return { success: true, data: { text: "Contenu du document simulé." } };
  }

  static async exportChat(chatText: string, format: string, title: string): Promise<any> {
    return { success: true, data: { download_url: "http://example.com/export." + format } };
  }
}
