'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { loginApi } from '@/lib/api';
import { setToken } from '@/lib/auth';
import { useAppStore } from '@/store/todoStore';
import styles from './login.module.css';

/**
 * Komponen halaman Login (Client Component).
 * Menangani form input email/password, validasi, dan proses autentikasi ke API Laravel.
 */
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAppStore((s) => s.setAuth);

  /**
   * Handler submit form login — mengirim email/password ke API dan menyimpan token + menus.
   */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginApi(email, password);
      // Simpan token ke cookie dan state global (token, user info, menus)
      setToken(data.token);
      setAuth(data.token, data.user, data.menus);
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login gagal.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Logo / ikon */}
        <div className={styles.iconWrapper}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
        </div>

        <h1 className={styles.title}>Selamat Datang</h1>
        <p className={styles.subtitle}>Masuk untuk mengelola tugas Anda</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Input email */}
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="Masukkan email"
              required
              autoComplete="email"
            />
          </div>

          {/* Input password */}
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="Masukkan password"
              required
              autoComplete="current-password"
            />
          </div>

          {/* Pesan error jika login gagal */}
          {error && <div className={styles.errorBox}>{error}</div>}

          {/* Tombol submit */}
          <button
            id="login-btn"
            type="submit"
            className={styles.button}
            disabled={loading}
          >
            {loading ? (
              <span className={styles.spinner} />
            ) : (
              'Masuk'
            )}
          </button>
        </form>

        {/* Credential hints untuk ketiga role */}
        <div className={styles.hintGroup}>
          <p className={styles.hintTitle}>Default credentials:</p>
          <div className={styles.hintItem}>
            <span className={`${styles.roleBadge} ${styles.roleMaker}`}>Maker</span>
            <span>admin@example.com / admin123</span>
          </div>
          <div className={styles.hintItem}>
            <span className={`${styles.roleBadge} ${styles.roleChecker}`}>Checker</span>
            <span>checker@example.com / admin123</span>
          </div>
          <div className={styles.hintItem}>
            <span className={`${styles.roleBadge} ${styles.roleViewer}`}>Viewer</span>
            <span>viewer@example.com / admin123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
