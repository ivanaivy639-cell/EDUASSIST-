import { useState, useEffect, useCallback } from 'react';
import { Classe } from '../types';
import ClasseService from '../services/classeService';

export function useClasse(id: number) {
  const [classe, setClasse] = useState<Classe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClasse = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ClasseService.getClasse(id);
      setClasse(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement de la classe');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClasse();
  }, [fetchClasse]);

  const refresh = useCallback(() => {
    fetchClasse();
  }, [fetchClasse]);

  return { classe, loading, error, refresh };
}
