'use client';

import { useState } from 'react';
import { Todo } from '@/lib/api';
import styles from './TodoItem.module.css';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number, isCompleted: boolean) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
}

/**
 * Komponen kartu Todo individual (Client Component).
 * Menampilkan judul, checkbox status, dan tombol edit & delete.
 */
export default function TodoItem({ todo, onToggle, onEdit, onDelete }: TodoItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  /**
   * Handler untuk toggle status done/pending todo.
   */
  async function handleToggle() {
    if (isToggling) return;
    setIsToggling(true);
    await onToggle(todo.id, !todo.is_completed);
    setIsToggling(false);
  }

  /**
   * Handler untuk konfirmasi dan eksekusi delete todo.
   */
  async function handleDelete() {
    if (isDeleting) return;
    setIsDeleting(true);
    await onDelete(todo.id);
    // Tidak perlu reset karena komponen akan di-unmount setelah delete
  }

  return (
    <div className={`${styles.card} ${todo.is_completed ? styles.completed : ''}`}>
      {/* Checkbox status todo */}
      <button
        id={`toggle-todo-${todo.id}`}
        onClick={handleToggle}
        disabled={isToggling}
        className={`${styles.checkbox} ${todo.is_completed ? styles.checkboxChecked : ''}`}
        aria-label={todo.is_completed ? 'Tandai belum selesai' : 'Tandai selesai'}
      >
        {todo.is_completed && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      {/* Konten todo */}
      <div className={styles.content}>
        <span className={`${styles.title} ${todo.is_completed ? styles.titleDone : ''}`}>
          {todo.title}
        </span>
        <span className={styles.date}>
          {new Date(todo.created_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      </div>

      {/* Badge status */}
      <span className={`${styles.badge} ${todo.is_completed ? styles.badgeDone : styles.badgePending}`}>
        {todo.is_completed ? 'Selesai' : 'Pending'}
      </span>

      {/* Tombol aksi */}
      <div className={styles.actions}>
        <button
          id={`edit-todo-${todo.id}`}
          onClick={() => onEdit(todo)}
          className={styles.editBtn}
          aria-label="Edit todo"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          id={`delete-todo-${todo.id}`}
          onClick={handleDelete}
          disabled={isDeleting}
          className={styles.deleteBtn}
          aria-label="Hapus todo"
        >
          {isDeleting ? (
            <span className={styles.miniSpinner} />
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
