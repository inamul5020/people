'use client';

import { useState, FormEvent } from 'react';
import { useSearchContext } from '@/contexts/SearchContext';

export default function SearchForm() {
  const { 
    searchParams, 
    setSearchParams, 
    setResults, 
    setPagination,
    setLoading 
  } = useSearchContext();

  const [localParams, setLocalParams] = useState(searchParams);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearchParams(localParams);

    try {
      const queryParams = new URLSearchParams({
        page: '1',
        limit: '50',
        ...Object.fromEntries(
          Object.entries(localParams).filter(([_, v]) => v !== '')
        ),
        sortBy: localParams.sortBy || 'id',
        sortOrder: localParams.sortOrder || 'ASC',
      });

      const response = await fetch(`/api/search?${queryParams}`);
      const data = await response.json();

      if (response.ok) {
        setResults(data.results);
        setPagination(data.pagination);
      } else {
        console.error('Search error:', data.error);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    const emptyParams = {
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
    setLocalParams(emptyParams);
    setSearchParams(emptyParams);
    setResults([]);
    setPagination(null);
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '20px' }}>Search Records</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '16px',
          marginBottom: '16px'
        }}>
          <div>
            <label htmlFor="firstName" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              className="input"
              value={localParams.firstName}
              onChange={(e) => setLocalParams({ ...localParams, firstName: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="lastName" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              className="input"
              value={localParams.lastName}
              onChange={(e) => setLocalParams({ ...localParams, lastName: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="city" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              City
            </label>
            <input
              id="city"
              type="text"
              className="input"
              value={localParams.city}
              onChange={(e) => setLocalParams({ ...localParams, city: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="state" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              State
            </label>
            <input
              id="state"
              type="text"
              className="input"
              value={localParams.state}
              onChange={(e) => setLocalParams({ ...localParams, state: e.target.value.toUpperCase() })}
              maxLength={2}
              style={{ textTransform: 'uppercase' }}
            />
          </div>
          <div>
            <label htmlFor="zipCode" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Zip Code
            </label>
            <input
              id="zipCode"
              type="text"
              className="input"
              value={localParams.zipCode}
              onChange={(e) => setLocalParams({ ...localParams, zipCode: e.target.value.replace(/\D/g, '').slice(0, 5) })}
              maxLength={5}
            />
          </div>
          <div>
            <label htmlFor="ssn" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              SSN
            </label>
            <input
              id="ssn"
              type="text"
              className="input"
              value={localParams.ssn}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                const formatted = value.length > 3 
                  ? `${value.slice(0, 3)}-${value.slice(3, 5)}-${value.slice(5, 9)}`
                  : value;
                setLocalParams({ ...localParams, ssn: formatted });
              }}
              maxLength={11}
              placeholder="XXX-XX-XXXX"
            />
          </div>
          <div>
            <label htmlFor="dateOfBirth" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Date of Birth
            </label>
            <input
              id="dateOfBirth"
              type="text"
              className="input"
              value={localParams.dateOfBirth}
              onChange={(e) => setLocalParams({ ...localParams, dateOfBirth: e.target.value })}
              placeholder="MM/DD/YYYY"
            />
          </div>
          <div>
            <label htmlFor="search" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              General Search (any field)
            </label>
            <input
              id="search"
              type="text"
              className="input"
              value={localParams.search}
              onChange={(e) => setLocalParams({ ...localParams, search: e.target.value })}
              placeholder="Search across all fields..."
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="button button-primary">
            Search
          </button>
          <button type="button" className="button button-secondary" onClick={handleReset}>
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}

