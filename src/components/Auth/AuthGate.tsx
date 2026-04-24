'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, type AppUser } from '@/store/useAppStore';

interface AuthGateProps {
  children: (user: AppUser) => React.ReactNode;
  requireAdmin?: boolean;
}

export default function AuthGate({ children, requireAdmin = false }: AuthGateProps) {
  const router = useRouter();
  const { users, currentUserId } = useAppStore();
  const [hydrated, setHydrated] = useState(false);

  // Avoid hydration mismatch: only read user state after the first client paint.
  useEffect(() => {
    setHydrated(true);
  }, []);

  const user = currentUserId ? users.find((u) => u.id === currentUserId) : null;

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace('/login');
    } else if (requireAdmin && user.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [hydrated, user, requireAdmin, router]);

  if (!hydrated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 14 }}>
        A carregar...
      </div>
    );
  }

  if (!user) return null;
  if (requireAdmin && user.role !== 'admin') return null;

  return <>{children(user)}</>;
}
