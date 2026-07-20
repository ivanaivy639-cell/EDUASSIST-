// Types pour les Classes (feature complète)

export type Niveau = '6e' | '5e' | '4e' | '3e' | 'Seconde' | 'Premiere' | 'Terminale';

export interface Matiere {
  id: number;
  nom: string;
  code: string;
  couleur: string;
}

export interface Classe {
  id: number;
  nom: string;
  niveau: Niveau;
  section?: string;
  serie?: string;
  description?: string;
  annee_scolaire: string;
  statut: 'active' | 'archived';
  est_active: boolean;
  nombre_eleves: number;
  nombre_matieres: number;
  matieres?: Matiere[];
  created_at?: string;
  updated_at?: string;
}

export interface ClasseFormData {
  nom: string;
  niveau: Niveau;
  section?: string;
  serie?: string;
  description?: string;
  annee_scolaire: string;
  statut: 'active' | 'archived';
  matieres?: { id: number }[];
}

export interface ClasseFilters {
  niveau?: Niveau | 'tous';
  statut?: 'active' | 'archived' | 'tous';
  annee_scolaire?: string;
  search?: string;
}

export interface ClasseSort {
  sort_by: 'nom' | 'niveau' | 'created_at' | 'nombre_eleves';
  sort_order: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}
