import { useState } from 'react';
import { ClasseFormData, Classe } from '../types';
import ClasseService from '../services/classeService';

export function useUpdateClasse() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateClasse = async (id: number, data: ClasseFormData): Promise<Classe | null> => {
    setLoading(true);
    setError(null);
    try {
      const classe = await ClasseService.updateClasse(id, data);
      return classe;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateClasse, loading, error };
}
