'use client';

import { useState } from 'react';
import { Todo } from '@/lib/api';
import styles from './TodoItem.module.css';

interface TodoItemProps {
  todo: Todo;
  canModify: boolean;   // Maker: dapat edit/hapus
  canApprove: boolean;  // Checker: dapat approve/reject
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

/**
 * Komponen kartu Todo individual dengan dukungan RBAC.
 * Menampilkan status badge (PENDING/APPROVED/REJECTED) dan tombol aksi sesuai role.
 */
export default function TodoItem({ todo, canModify, canApprove, onApprove, onReject }: TodoItemProps) {
  const [isActing, setIsActing] = useState(false);

  /**
   * Helper untuk mendapatkan class CSS badge berdasarkan status todo.
   */
  function getStatusBadgeClass(status: string) {
    if (status === 'APPROVED') return styles.badgeApproved;
    if (status === 'REJECTED') return styles.badgeRejected;
    return styles.badgePending;
  }

  /**
   * Helper untuk label status yang ditampilkan.
   */
  function getStatusLabel(status: string) {
    if (status === 'APPROVED') return 'Approved';
    if (status === 'REJECTED') return 'Rejected';
    return 'Pending';
  }

  /**
   * Handler approve — menjalankan callback dan reset loading state.
   */
  async function handleApprove() {
    if (isActing) return;
    setIsActing(true);
    await onApprove(todo.id);
    setIsActing(false);
  }

  /**
   * Handler reject — menjalankan callback dan reset loading state.
   */
  async function handleReject() {
    if (isActing) return;
    setIsActing(true);
    await onReject(todo.id);
    setIsActing(false);
  }

  const isPending = todo.status === 'PENDING';

  return (
    <div className={`${styles.card} ${todo.status === 'APPROVED' ? styles.cardApproved : ''} ${todo.status === 'REJECTED' ? styles.cardRejected : ''}`}>
      {/* Konten todo */}
      <div className={styles.content}>
        <span className={`${styles.title} ${todo.status === 'APPROVED' ? styles.titleApproved : ''} ${todo.status === 'REJECTED' ? styles.titleRejected : ''}`}>
          {todo.title}
        </span>
        <div className={styles.meta}>
          <span className={styles.date}>
            {new Date(todo.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
          {todo.user && (
            <span className={styles.author}>by {todo.user.name}</span>
          )}
        </div>
      </div>

      {/* Badge status RBAC (PENDING / APPROVED / REJECTED) */}
      <span className={`${styles.badge} ${getStatusBadgeClass(todo.status)}`}>
        {getStatusLabel(todo.status)}
      </span>

      {/* Tombol aksi: Approve/Reject untuk Checker (hanya saat PENDING) */}
      {canApprove && isPending && (
        <div className={styles.actions}>
          <button
            id={`approve-todo-${todo.id}`}
            onClick={handleApprove}
            disabled={isActing}
            className={styles.approveBtn}
            aria-label="Setujui todo"
            title="Approve"
          >
            {isActing ? (
              <span className={styles.miniSpinner} />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
          <button
            id={`reject-todo-${todo.id}`}
            onClick={handleReject}
            disabled={isActing}
            className={styles.rejectBtn}
            aria-label="Tolak todo"
            title="Reject"
          >
            {isActing ? (
              <span className={styles.miniSpinner} />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Viewer: tidak ada tombol aksi */}
      {!canModify && !canApprove && (
        <div className={styles.viewerOnly}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
      )}
    </div>
  );
}
