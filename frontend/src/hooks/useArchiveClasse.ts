import { useState } from 'react';
import { Classe } from '../types';
import ClasseService from '../services/classeService';

export function useArchiveClasse() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const archiveClasse = async (id: number): Promise<Classe | null> => {
    setLoading(true);
    setError(null);
    try {
      const classe = await ClasseService.archiveClasse(id);
      return classe;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'archivage');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const unarchiveClasse = async (id: number): Promise<Classe | null> => {
    setLoading(true);
    setError(null);
    try {
      const classe = await ClasseService.unarchiveClasse(id);
      return classe;
    } catch (err: any) {
      setError(err.message || 'Erreur lors du désarchivage');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { archiveClasse, unarchiveClasse, loading, error };
}
