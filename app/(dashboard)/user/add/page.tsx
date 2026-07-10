'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/todoStore';
import { createUserRequestApi, AddUserPayload } from '@/lib/api';
import styles from './add-user.module.css';

interface Role {
  id: number;
  name: string;
}

/**
 * Halaman Add User baru (menggantikan modal).
 * Mengajukan request penambahan user — data masuk ke tabel User dengan status
 * WAITING_FOR_APPROVAL, sekaligus ke tabel approval_maintenance sebagai audit trail.
 * Hanya dapat diakses oleh user yang memiliki can_modify = true pada sub menu USER.
 */
export default function AddUserPage() {
  const router  = useRouter();
  const { token, menus } = useAppStore();

  // Cek permission can_modify untuk sub menu USER
  const userSubMenuPermission = menus
    .flatMap((m) => m.sub_menus)
    .find((sm) => sm.code === 'USER');
  const canModify = userSubMenuPermission?.can_modify === true;

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [roleId,   setRoleId]   = useState<number | ''>('');
  const [roles,    setRoles]    = useState<Role[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect jika tidak punya akses
  useEffect(() => {
    if (menus.length > 0 && !canModify) {
      router.replace('/user');
    }
  }, [menus, canModify, router]);

  // Load daftar role — sesuai schema: Maker=1, Checker=2, Viewer=3
  useEffect(() => {
    setRoles([
      { id: 1, name: 'Maker' },
      { id: 2, name: 'Checker' },
      { id: 3, name: 'Viewer' },
    ]);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim())         { setError('Nama tidak boleh kosong.'); return; }
    if (!email.trim())        { setError('Email tidak boleh kosong.'); return; }
    if (!password)            { setError('Password tidak boleh kosong.'); return; }
    if (password.length < 6)  { setError('Password minimal 6 karakter.'); return; }
    if (roleId === '')        { setError('Pilih role untuk user ini.'); return; }
    if (!token)               { setError('Sesi tidak valid. Silakan login kembali.'); return; }

    const payload: AddUserPayload = {
      name:     name.trim(),
      email:    email.trim(),
      password: password,
      role_id:  roleId as number,
    };

    setIsSubmitting(true);
    try {
      await createUserRequestApi(token, payload);
      // Berhasil — kembali ke list user dengan pesan sukses via URL param
      router.push('/user?added=1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengajukan request.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>

      {/* ── Breadcrumb ── */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <button
          id="add-user-back-btn"
          className={styles.breadcrumbLink}
          onClick={() => router.push('/user')}
          type="button"
        >
          👥 User Management
        </button>
        <span className={styles.breadcrumbSep}>›</span>
        <span className={styles.breadcrumbCurrent}>Tambah User</span>
      </nav>

      {/* ── Page Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>👤</div>
          <div>
            <h1 className={styles.title}>Tambah User Baru</h1>
            <p className={styles.subtitle}>
              Request akan menunggu persetujuan sebelum user aktif.
            </p>
          </div>
        </div>
      </div>

      {/* ── Notice ── */}
      <div className={styles.notice}>
        <span className={styles.noticeIcon}>ℹ</span>
        <span>
          Data user akan dimasukkan ke tabel <strong>User</strong> dengan status{' '}
          <strong>WAITING FOR APPROVAL</strong> dan dicatat di{' '}
          <strong>approval_maintenance</strong> sebagai audit trail.
          User baru hanya dapat login setelah disetujui oleh Checker.
        </span>
      </div>

      {/* ── Form Card ── */}
      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form} noValidate>

          <div className={styles.formGrid}>
            {/* Name */}
            <div className={styles.field}>
              <label htmlFor="add-user-name" className={styles.label}>
                Nama Lengkap <span className={styles.required}>*</span>
              </label>
              <input
                id="add-user-name"
                type="text"
                className={styles.input}
                placeholder="Masukkan nama lengkap"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                autoComplete="off"
              />
            </div>

            {/* Email */}
            <div className={styles.field}>
              <label htmlFor="add-user-email" className={styles.label}>
                Email <span className={styles.required}>*</span>
              </label>
              <input
                id="add-user-email"
                type="email"
                className={styles.input}
                placeholder="contoh@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                autoComplete="off"
              />
            </div>

            {/* Password */}
            <div className={styles.field}>
              <label htmlFor="add-user-password" className={styles.label}>
                Password <span className={styles.required}>*</span>
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  id="add-user-password"
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Role */}
            <div className={styles.field}>
              <label htmlFor="add-user-role" className={styles.label}>
                Role <span className={styles.required}>*</span>
              </label>
              <select
                id="add-user-role"
                className={styles.select}
                value={roleId}
                onChange={(e) => setRoleId(e.target.value === '' ? '' : Number(e.target.value))}
                disabled={isSubmitting}
              >
                <option value="">— Pilih Role —</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className={styles.errorBox} role="alert">
              <span>⚠</span> {error}
            </div>
          )}

          {/* Actions */}
          <div className={styles.actions}>
            <button
              type="button"
              id="add-user-cancel-btn"
              className={styles.cancelBtn}
              onClick={() => router.push('/user')}
              disabled={isSubmitting}
            >
              ← Batal
            </button>
            <button
              type="submit"
              id="add-user-submit-btn"
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className={styles.btnLoading}>
                  <span className={styles.btnSpinner} /> Mengirim...
                </span>
              ) : (
                '✔ Ajukan Request'
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
