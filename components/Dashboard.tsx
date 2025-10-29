'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SearchForm from './SearchForm';
import SearchResults from './SearchResults';
import ImportForm from './ImportForm';

type Tab = 'search' | 'import';

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('search');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
      } else {
        router.push('/');
      }
    } catch (error) {
      router.push('/');
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (checkingAuth) {
    return (
      <div className="loading">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container">
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px',
        padding: '20px 0',
        borderBottom: '2px solid #ddd'
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>
          Demographic Data Search
        </h1>
        <button 
          className="button button-secondary"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      <nav style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '24px',
        borderBottom: '1px solid #ddd'
      }}>
        <button
          className="button"
          onClick={() => setActiveTab('search')}
          style={{
            background: activeTab === 'search' ? '#0070f3' : 'transparent',
            color: activeTab === 'search' ? 'white' : '#333',
            border: 'none',
            borderBottom: activeTab === 'search' ? '2px solid #0070f3' : '2px solid transparent',
            borderRadius: '0',
            padding: '12px 24px',
            cursor: 'pointer'
          }}
        >
          Search
        </button>
        <button
          className="button"
          onClick={() => setActiveTab('import')}
          style={{
            background: activeTab === 'import' ? '#0070f3' : 'transparent',
            color: activeTab === 'import' ? 'white' : '#333',
            border: 'none',
            borderBottom: activeTab === 'import' ? '2px solid #0070f3' : '2px solid transparent',
            borderRadius: '0',
            padding: '12px 24px',
            cursor: 'pointer'
          }}
        >
          Import Data
        </button>
      </nav>

      {activeTab === 'search' && (
        <>
          <SearchForm />
          <SearchResults />
        </>
      )}

      {activeTab === 'import' && <ImportForm />}
    </div>
  );
}

