'use client';

import Dashboard from '@/components/Dashboard';
import { SearchProvider } from '@/contexts/SearchContext';

export default function DashboardPage() {
  return (
    <SearchProvider>
      <Dashboard />
    </SearchProvider>
  );
}

