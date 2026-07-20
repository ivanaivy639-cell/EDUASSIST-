import { apiClient } from './ApiClient';
import {
  Classe,
  ClasseFormData,
  ClasseFilters,
  ClasseSort,
  PaginatedResponse,
} from '../types';

class ClasseServiceClass {
  private buildParams(
    filters: ClasseFilters,
    sort: ClasseSort,
    page: number
  ): Record<string, any> {
    const params: Record<string, any> = {
      page,
      sort_by: sort.sort_by,
      sort_order: sort.sort_order,
    };
    if (filters.niveau && filters.niveau !== 'tous') params.niveau = filters.niveau;
    if (filters.statut && filters.statut !== 'tous') params.statut = filters.statut;
    if (filters.annee_scolaire) params.annee_scolaire = filters.annee_scolaire;
    if (filters.search) params.search = filters.search;
    return params;
  }

  async getClasses(
    filters: ClasseFilters = {},
    sort: ClasseSort = { sort_by: 'created_at', sort_order: 'desc' },
    page: number = 1
  ): Promise<PaginatedResponse<Classe>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Classe>>('/classes', {
        params: this.buildParams(filters, sort, page),
      });
      return response.data;
    } catch {
      // Fallback: retourne des données mockées si l'API n'est pas encore prête
      return this.getMockClasses(filters, sort, page);
    }
  }

  async getClasse(id: number): Promise<Classe> {
    try {
      const response = await apiClient.get<{ data: Classe }>(`/classes/${id}`);
      return response.data.data;
    } catch {
      const mock = this.getMockData().find(c => c.id === id);
      if (!mock) throw new Error('Classe introuvable');
      return mock;
    }
  }

  async createClasse(data: ClasseFormData): Promise<Classe> {
    const response = await apiClient.post<{ data: Classe }>('/classes', data);
    return response.data.data;
  }

  async updateClasse(id: number, data: ClasseFormData): Promise<Classe> {
    const response = await apiClient.put<{ data: Classe }>(`/classes/${id}`, data);
    return response.data.data;
  }

  async deleteClasse(id: number): Promise<void> {
    await apiClient.delete(`/classes/${id}`);
  }

  async archiveClasse(id: number): Promise<Classe> {
    const response = await apiClient.put<{ data: Classe }>(`/classes/${id}/archive`);
    return response.data.data;
  }

  async unarchiveClasse(id: number): Promise<Classe> {
    const response = await apiClient.put<{ data: Classe }>(`/classes/${id}/unarchive`);
    return response.data.data;
  }

  // ── Données de démonstration (si l'API n'est pas encore connectée) ───
  private getMockData(): Classe[] {
    return [
      {
        id: 1,
        nom: 'Terminale S1',
        niveau: 'Terminale',
        section: 'S',
        annee_scolaire: '2024-2025',
        statut: 'active',
        est_active: true,
        nombre_eleves: 32,
        nombre_matieres: 7,
        matieres: [
          { id: 1, nom: 'Mathématiques', code: 'MATH', couleur: '#EF4444' },
          { id: 2, nom: 'Physique-Chimie', code: 'PC', couleur: '#3B82F6' },
          { id: 3, nom: 'SVT', code: 'SVT', couleur: '#10B981' },
          { id: 5, nom: 'Français', code: 'FR', couleur: '#8B5CF6' },
        ],
      },
      {
        id: 2,
        nom: 'Première ES2',
        niveau: 'Premiere',
        section: 'ES',
        annee_scolaire: '2024-2025',
        statut: 'active',
        est_active: true,
        nombre_eleves: 28,
        nombre_matieres: 5,
        matieres: [
          { id: 4, nom: 'Histoire-Géographie', code: 'HG', couleur: '#F59E0B' },
          { id: 5, nom: 'Français', code: 'FR', couleur: '#8B5CF6' },
          { id: 6, nom: 'Anglais', code: 'AN', couleur: '#EC4899' },
        ],
      },
      {
        id: 3,
        nom: '3e A',
        niveau: '3e',
        annee_scolaire: '2024-2025',
        statut: 'active',
        est_active: true,
        nombre_eleves: 25,
        nombre_matieres: 6,
        matieres: [
          { id: 1, nom: 'Mathématiques', code: 'MATH', couleur: '#EF4444' },
          { id: 6, nom: 'Anglais', code: 'AN', couleur: '#EC4899' },
        ],
      },
      {
        id: 4,
        nom: 'Seconde B',
        niveau: 'Seconde',
        annee_scolaire: '2023-2024',
        statut: 'archived',
        est_active: false,
        nombre_eleves: 30,
        nombre_matieres: 8,
        matieres: [],
      },
    ];
  }

  private getMockClasses(
    filters: ClasseFilters,
    sort: ClasseSort,
    page: number
  ): PaginatedResponse<Classe> {
    let data = this.getMockData();

    if (filters.niveau && filters.niveau !== 'tous') {
      data = data.filter(c => c.niveau === filters.niveau);
    }
    if (filters.statut && filters.statut !== 'tous') {
      data = data.filter(c => c.statut === filters.statut);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      data = data.filter(c => c.nom.toLowerCase().includes(q));
    }

    return {
      data,
      current_page: 1,
      last_page: 1,
      total: data.length,
      per_page: 20,
    };
  }
}

export default new ClasseServiceClass();
