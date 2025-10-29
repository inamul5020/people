'use client';

import { useState, useEffect } from 'react';
import { useSearchContext } from '@/contexts/SearchContext';

interface Record {
  id: number;
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  ssn: string;
  date_of_birth: string | null;
  created_at: string;
}

export default function SearchResults() {
  const { 
    results, 
    pagination, 
    loading, 
    searchParams, 
    setResults, 
    setPagination, 
    setLoading,
    setSearchParams 
  } = useSearchContext();

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const handleSort = async (column: string) => {
    const currentSort = searchParams.sortBy || 'id';
    const currentOrder = searchParams.sortOrder || 'ASC';
    
    let newSortBy = column;
    let newSortOrder: 'ASC' | 'DESC' = 'ASC';
    
    if (currentSort === column) {
      newSortOrder = currentOrder === 'ASC' ? 'DESC' : 'ASC';
    }

    const updatedParams = {
      ...searchParams,
      sortBy: newSortBy,
      sortOrder: newSortOrder,
    };

    setSearchParams(updatedParams);
    setLoading(true);

    try {
      const queryParams = new URLSearchParams({
        page: String(pagination?.page || 1),
        limit: '50',
        ...Object.fromEntries(
          Object.entries(searchParams).filter(([k, v]) => k !== 'sortBy' && k !== 'sortOrder' && v !== '')
        ),
        sortBy: newSortBy,
        sortOrder: newSortOrder,
      });

      const response = await fetch(`/api/search?${queryParams}`);
      const data = await response.json();

      if (response.ok) {
        setResults(data.results);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    if (!pagination || page < 1 || page > pagination.totalPages) return;

    setLoading(true);

    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: '50',
        ...Object.fromEntries(
          Object.entries(searchParams).filter(([_, v]) => v !== '')
        ),
        sortBy: searchParams.sortBy || 'id',
        sortOrder: searchParams.sortOrder || 'ASC',
      });

      const response = await fetch(`/api/search?${queryParams}`);
      const data = await response.json();

      if (response.ok) {
        setResults(data.results);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSortIcon = (column: string) => {
    if (searchParams.sortBy !== column) return '↕️';
    return searchParams.sortOrder === 'ASC' ? '↑' : '↓';
  };

  if (loading && results.length === 0) {
    return (
      <div className="card">
        <div className="loading">
          <p>Searching...</p>
        </div>
      </div>
    );
  }

  if (results.length === 0 && !loading) {
    return (
      <div className="card">
        <p style={{ textAlign: 'center', color: '#666' }}>
          No results found. Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      {pagination && (
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>Total Results:</strong> {pagination.total.toLocaleString()}
          </div>
          <div>
            <strong>Page:</strong> {pagination.page} of {pagination.totalPages}
          </div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '10px', color: '#666' }}>
          Loading...
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')}>
                ID {getSortIcon('id')}
              </th>
              <th onClick={() => handleSort('first_name')}>
                First Name {getSortIcon('first_name')}
              </th>
              <th onClick={() => handleSort('last_name')}>
                Last Name {getSortIcon('last_name')}
              </th>
              <th>Address</th>
              <th onClick={() => handleSort('city')}>
                City {getSortIcon('city')}
              </th>
              <th onClick={() => handleSort('state')}>
                State {getSortIcon('state')}
              </th>
              <th onClick={() => handleSort('zip_code')}>
                Zip Code {getSortIcon('zip_code')}
              </th>
              <th>SSN</th>
              <th onClick={() => handleSort('date_of_birth')}>
                Date of Birth {getSortIcon('date_of_birth')}
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((record: Record) => (
              <tr key={record.id}>
                <td>{record.id}</td>
                <td>{record.first_name}</td>
                <td>{record.last_name}</td>
                <td>{record.address}</td>
                <td>{record.city}</td>
                <td>{record.state}</td>
                <td>{record.zip_code}</td>
                <td>{record.ssn}</td>
                <td>{formatDate(record.date_of_birth)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1 || loading}
          >
            Previous
          </button>
          
          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
            const page = pagination.page <= 3 
              ? i + 1 
              : pagination.page >= pagination.totalPages - 2
              ? pagination.totalPages - 4 + i
              : pagination.page - 2 + i;
            
            if (page < 1 || page > pagination.totalPages) return null;
            
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                disabled={loading}
                className={pagination.page === page ? 'active' : ''}
              >
                {page}
              </button>
            );
          })}
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages || loading}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

