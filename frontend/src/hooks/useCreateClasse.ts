import { useState } from 'react';
import { ClasseFormData, Classe } from '../types';
import ClasseService from '../services/classeService';

export function useCreateClasse() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createClasse = async (data: ClasseFormData): Promise<Classe | null> => {
    setLoading(true);
    setError(null);
    try {
      const classe = await ClasseService.createClasse(data);
      return classe;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createClasse, loading, error };
}
