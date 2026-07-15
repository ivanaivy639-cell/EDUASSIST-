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
}
