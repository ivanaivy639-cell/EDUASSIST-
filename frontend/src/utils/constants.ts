import { Niveau } from '../types';

export const NIVEAUX: { value: Niveau | 'tous'; label: string }[] = [
  { value: 'tous', label: 'Tous' },
  { value: '6e', label: '6e' },
  { value: '5e', label: '5e' },
  { value: '4e', label: '4e' },
  { value: '3e', label: '3e' },
  { value: 'Seconde', label: 'Seconde' },
  { value: 'Premiere', label: 'Première' },
  { value: 'Terminale', label: 'Terminale' },
];

export const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'created_at', label: 'Plus récent' },
  { value: 'created_at_asc', label: 'Plus ancien' },
  { value: 'nom', label: 'Nom A→Z' },
  { value: 'nombre_eleves', label: 'Nb élèves' },
];

export const ANNEES_SCOLAIRES = ['2023-2024', '2024-2025', '2025-2026'];
