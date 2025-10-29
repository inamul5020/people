'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface SearchParams {
  firstName: string;
  lastName: string;
  city: string;
  state: string;
  zipCode: string;
  ssn: string;
  dateOfBirth: string;
  search: string;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface SearchContextType {
  searchParams: SearchParams;
  setSearchParams: (params: SearchParams) => void;
  results: any[];
  setResults: (results: any[]) => void;
  pagination: Pagination | null;
  setPagination: (pagination: Pagination | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const defaultSearchParams: SearchParams = {
  firstName: '',
  lastName: '',
  city: '',
  state: '',
  zipCode: '',
  ssn: '',
  dateOfBirth: '',
  search: '',
  sortBy: 'id',
  sortOrder: 'ASC',
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useState<SearchParams>(defaultSearchParams);
  const [results, setResults] = useState<any[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <SearchContext.Provider
      value={{
        searchParams,
        setSearchParams,
        results,
        setResults,
        pagination,
        setPagination,
        loading,
        setLoading,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchContext() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
}

