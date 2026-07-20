import { ClasseFormData } from '../types';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateClasseForm(data: ClasseFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.nom || data.nom.trim().length < 2) {
    errors.push({ field: 'nom', message: 'Le nom doit comporter au moins 2 caractères' });
  }
  if (data.nom && data.nom.trim().length > 100) {
    errors.push({ field: 'nom', message: 'Le nom ne peut pas dépasser 100 caractères' });
  }
  if (!data.niveau) {
    errors.push({ field: 'niveau', message: 'Le niveau est requis' });
  }
  if (!data.annee_scolaire || !/^\d{4}-\d{4}$/.test(data.annee_scolaire)) {
    errors.push({
      field: 'annee_scolaire',
      message: "L'année scolaire doit être au format YYYY-YYYY (ex: 2024-2025)",
    });
  }
  if (data.description && data.description.length > 500) {
    errors.push({
      field: 'description',
      message: 'La description ne peut pas dépasser 500 caractères',
    });
  }

  return errors;
}

export function getErrorByField(errors: ValidationError[], field: string): string | undefined {
  return errors.find(e => e.field === field)?.message;
}
