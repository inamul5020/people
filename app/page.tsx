'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Login from '@/components/Login';

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        router.push('/dashboard');
      } else {
        setIsChecking(false);
      }
    } catch (error) {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <div className="loading">
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={checkAuth} />;
  }

  return null;
}

