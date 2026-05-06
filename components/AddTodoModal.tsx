'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Todo } from '@/lib/api';
import styles from './AddTodoModal.module.css';

interface AddTodoModalProps {
  editingTodo: Todo | null;
  onClose: () => void;
  onAdd: (title: string) => Promise<void>;
  onUpdate: (id: number, title: string) => Promise<void>;
}

/**
 * Modal untuk menambahkan atau mengedit todo (Client Component).
 * Jika editingTodo tidak null, mode edit; jika null, mode tambah baru.
 */
export default function AddTodoModal({ editingTodo, onClose, onAdd, onUpdate }: AddTodoModalProps) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Isi form dengan data todo yang sedang diedit
  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title);
    } else {
      setTitle('');
    }
    setError('');
  }, [editingTodo]);

  /**
   * Handler submit form: validasi, kirim ke API, tutup modal.
   */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedTitle = title.trim();

    // Validasi: judul tidak boleh kosong
    if (!trimmedTitle) {
      setError('Judul tugas tidak boleh kosong.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (editingTodo) {
        await onUpdate(editingTodo.id, trimmedTitle);
      } else {
        await onAdd(trimmedTitle);
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Menutup modal jika user klik area di luar modal (overlay).
   */
  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {editingTodo ? 'Edit Tugas' : 'Tambah Tugas Baru'}
          </h2>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Tutup modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="todo-title" className={styles.label}>Judul Tugas</label>
            <input
              id="todo-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.input}
              placeholder="Masukkan judul tugas..."
              autoFocus
              maxLength={255}
            />
            <span className={styles.charCount}>{title.length}/255</span>
          </div>

          {/* Pesan error validasi */}
          {error && <div className={styles.errorBox}>{error}</div>}

          <div className={styles.buttons}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelBtn}
            >
              Batal
            </button>
            <button
              id="submit-todo-btn"
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? (
                <span className={styles.spinner} />
              ) : editingTodo ? (
                'Simpan Perubahan'
              ) : (
                'Tambahkan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
