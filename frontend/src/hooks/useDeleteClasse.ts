import { useState } from 'react';
import ClasseService from '../services/classeService';

export function useDeleteClasse() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteClasse = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await ClasseService.deleteClasse(id);
      return true;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteClasse, loading, error };
}
