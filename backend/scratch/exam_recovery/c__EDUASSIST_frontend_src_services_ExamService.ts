import { apiClient } from './ApiClient';
import type {
  ExamCreateRequest,
  ExamCreateResponse,
  ExamListResponse,
  ExamDetailResponse,
  ExamResultsResponse,
} from '../types/exam.types';

const EXAM_BASE = '/exams';

export class ExamService {
  /**
   * Lister tous les examens de l'enseignant.
   */
  static async list(): Promise<ExamListResponse> {
    const response = await apiClient.get<ExamListResponse>(EXAM_BASE);
    return response.data;
  }

  /**
   * Créer un nouvel examen.
   */
  static async create(data: ExamCreateRequest): Promise<ExamCreateResponse> {
    const response = await apiClient.post<ExamCreateResponse>(EXAM_BASE, data);
    return response.data;
  }

  /**
   * Voir le détail d'un examen + ses soumissions.
   */
  static async getDetail(id: number): Promise<ExamDetailResponse> {
    const response = await apiClient.get<ExamDetailResponse>(`${EXAM_BASE}/${id}`);
    return response.data;
  }

  /**
   * Résultats détaillés d'un examen avec statistiques.
   */
  static async getResults(id: number): Promise<ExamResultsResponse> {
    const response = await apiClient.get<ExamResultsResponse>(`${EXAM_BASE}/${id}/results`);
    return response.data;
  }

  /**
   * Activer/désactiver un examen.
   */
  static async toggleActive(id: number, isActive: boolean): Promise<{ success: boolean }> {
    const response = await apiClient.put<{ success: boolean }>(`${EXAM_BASE}/${id}`, {
      is_active: isActive,
    });
    return response.data;
  }

  /**
   * Supprimer un examen.
   */
  static async delete(id: number): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(`${EXAM_BASE}/${id}`);
    return response.data;
  }
}
