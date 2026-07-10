'use client';

import { useState, useEffect, useCallback } from 'react';
import { createUserRequestApi, AddUserPayload } from '@/lib/api';
import styles from './AddUserModal.module.css';

interface Role {
  id: number;
  name: string;
}

interface AddUserModalProps {
  token: string;
  /** Dipanggil setelah modal ditutup (cancel atau sukses) */
  onClose: () => void;
  /** Dipanggil hanya setelah submit berhasil */
  onSuccess: () => void;
}

/**
 * Modal form untuk mengajukan request penambahan user baru.
 * Data yang disubmit tidak langsung masuk ke tabel User, melainkan
 * ke tabel approval_maintenance dengan status WAITING_FOR_APPROVAL.
 */
export default function AddUserModal({ token, onClose, onSuccess }: AddUserModalProps) {
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [roleId,   setRoleId]   = useState<number | ''>('');
  const [roles,    setRoles]    = useState<Role[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Fetch roles dari store — kita hardcode based on schema untuk simplicity
  // (role data bisa juga di-fetch dari /api/roles jika ada endpoint-nya)
  useEffect(() => {
    // Role sesuai schema: Maker=1, Checker=2, Viewer=3
    setRoles([
      { id: 1, name: 'Maker' },
      { id: 2, name: 'Checker' },
      { id: 3, name: 'Viewer' },
    ]);
  }, []);

  // Tutup modal saat klik backdrop
  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  // Tutup modal dengan Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validasi sederhana
    if (!name.trim())    { setError('Nama tidak boleh kosong.'); return; }
    if (!email.trim())   { setError('Email tidak boleh kosong.'); return; }
    if (!password)       { setError('Password tidak boleh kosong.'); return; }
    if (password.length < 6) { setError('Password minimal 6 karakter.'); return; }
    if (roleId === '')   { setError('Pilih role untuk user ini.'); return; }

    const payload: AddUserPayload = {
      name:     name.trim(),
      email:    email.trim(),
      password: password,
      role_id:  roleId as number,
    };

    setIsSubmitting(true);
    try {
      await createUserRequestApi(token, payload);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengajukan request.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick} role="dialog" aria-modal="true">
      <div className={styles.modal}>

        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <div className={styles.modalIcon}>👤</div>
            <div>
              <h2 className={styles.modalTitle}>Tambah User Baru</h2>
              <p className={styles.modalSubtitle}>Request akan menunggu persetujuan.</p>
            </div>
          </div>
          <button
            id="add-user-modal-close-btn"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Tutup modal"
          >
            ✕
          </button>
        </div>

        {/* Notice */}
        <div className={styles.notice}>
          <span className={styles.noticeIcon}>ℹ</span>
          <span>Data tidak langsung tersimpan. Request akan dikirim ke <strong>approval_maintenance</strong> dengan status <strong>WAITING FOR APPROVAL</strong>.</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>

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
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
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
                'Ajukan Request'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
