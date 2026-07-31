import { useState, useCallback, useRef } from 'react';

export function useSearch(delay: number = 300) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setDebouncedQuery(text);
    }, delay);
  }, [delay]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return { query, debouncedQuery, handleSearch, clearSearch };
}
