'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/todoStore';
import { getToken } from '@/lib/auth';
import { fetchMenusApi } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import styles from './dashboard-layout.module.css';

/**
 * Layout untuk semua halaman yang dilindungi (dashboard route group).
 * Menyediakan Sidebar dinamis dan konten utama.
 * Melakukan re-hydration menu dari API jika store kosong (setelah page refresh).
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, menus, setAuth } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    // Jika user dan menus sudah ada di store, tidak perlu fetch ulang
    if (user && menus.length > 0) return;

    // Re-hydrate store setelah page refresh menggunakan token dari cookie
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch menus dari API untuk restore state setelah refresh
    fetchMenusApi(token).then((fetchedMenus) => {
      // Decode JWT untuk mendapatkan user info (tanpa library tambahan)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setAuth(token, {
          id: payload.sub,
          name: payload.name || 'User',
          email: payload.email || '',
          role: payload.role || '',
        }, fetchedMenus);
      } catch {
        router.push('/login');
      }
    }).catch(() => {
      router.push('/login');
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.appLayout}>
      <Sidebar />
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
