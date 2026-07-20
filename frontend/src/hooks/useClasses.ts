import { useState, useEffect, useCallback } from 'react';
import { Classe, ClasseFilters, ClasseSort, PaginatedResponse } from '../types';
import ClasseService from '../services/classeService';

export function useClasses(initialFilters: ClasseFilters = {}) {
  const [classes, setClasses] = useState<Classe[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ClasseFilters>(initialFilters);
  const [sort, setSort] = useState<ClasseSort>({ sort_by: 'created_at', sort_order: 'desc' });

  const fetchClasses = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ClasseService.getClasses(filters, sort, page);
      setClasses(page === 1 ? response.data : [...classes, ...response.data]);
      setPagination({
        currentPage: response.current_page,
        lastPage: response.last_page,
        total: response.total,
      });
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des classes');
    } finally {
      setLoading(false);
    }
  }, [filters, sort]);

  useEffect(() => {
    fetchClasses(1);
  }, [fetchClasses]);

  const loadMore = useCallback(() => {
    if (pagination.currentPage < pagination.lastPage && !loading) {
      fetchClasses(pagination.currentPage + 1);
    }
  }, [pagination, loading, fetchClasses]);

  const refresh = useCallback(() => {
    fetchClasses(1);
  }, [fetchClasses]);

  return {
    classes,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    sort,
    setSort,
    loadMore,
    refresh,
  };
}
