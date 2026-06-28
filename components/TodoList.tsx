'use client';

import { useState, useEffect, useMemo } from 'react';
import { Todo, fetchTodosApi, createTodoApi, approveTodoApi, rejectTodoApi } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { useAppStore } from '@/store/todoStore';
import TodoItem from './TodoItem';
import AddTodoModal from './AddTodoModal';
import styles from './TodoList.module.css';

interface TodoListProps {
  initialTodos: Todo[];
  token: string;
  serverError?: string;
}

/**
 * Komponen utama daftar Todo (Client Component) dengan dukungan RBAC.
 * Mengelola search, CRUD (Maker), Approve/Reject (Checker), dan tampilan (Viewer).
 */
export default function TodoList({ initialTodos, token, serverError }: TodoListProps) {
  const { todos, setTodos, addTodo, updateTodo, canModify, canApprove } = useAppStore();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(serverError || '');

  const userCanModify = canModify();
  const userCanApprove = canApprove();

  // Inisialisasi store dengan data awal dari server saat pertama mount
  useEffect(() => {
    setTodos(initialTodos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Filter todos berdasarkan teks pencarian (client-side filtering).
   */
  const filteredTodos = useMemo(() => {
    if (!search.trim()) return todos;
    return todos.filter((t) =>
      t.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [todos, search]);

  /**
   * Refresh daftar todos dari API.
   */
  async function refreshTodos() {
    try {
      const fresh = await fetchTodosApi(token, '');
      setTodos(fresh);
    } catch {
      setError('Gagal merefresh todos.');
    }
  }

  /**
   * Menambahkan todo baru via API (hanya Maker).
   */
  async function handleAdd(title: string) {
    try {
      const newTodo = await createTodoApi(token, title);
      addTodo(newTodo);
      setError('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menambah todo.';
      setError(msg);
    }
  }

  /**
   * Menyetujui todo yang PENDING via API (hanya Checker).
   */
  async function handleApprove(id: number) {
    try {
      const approved = await approveTodoApi(token, id);
      updateTodo(approved);
      setError('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyetujui todo.';
      setError(msg);
    }
  }

  /**
   * Menolak todo yang PENDING via API (hanya Checker).
   */
  async function handleReject(id: number) {
    try {
      const rejected = await rejectTodoApi(token, id);
      updateTodo(rejected);
      setError('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menolak todo.';
      setError(msg);
    }
  }

  // Hitung statistik todo berdasarkan status
  const totalTodos = todos.length;
  const approvedTodos = todos.filter((t) => t.status === 'APPROVED').length;
  const pendingTodos = todos.filter((t) => t.status === 'PENDING').length;

  return (
    <div className={styles.container}>
      {/* Header dengan judul dan statistik */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logoIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>
          <div>
            <h1 className={styles.title}>Todo List</h1>
            <p className={styles.stats}>
              {approvedTodos} disetujui · {pendingTodos} menunggu · {totalTodos} total
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar berdasarkan approved */}
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: totalTodos > 0 ? `${(approvedTodos / totalTodos) * 100}%` : '0%' }}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className={styles.errorBox}>
          <span>{error}</span>
          <button onClick={() => setError('')} className={styles.errorClose}>×</button>
        </div>
      )}

      {/* Search dan tombol tambah */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            id="search-input"
            type="text"
            placeholder="Cari tugas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          {search && (
            <button onClick={() => setSearch('')} className={styles.clearSearch}>×</button>
          )}
        </div>

        {/* Tombol Tambah — hanya tampil untuk Maker */}
        {userCanModify && (
          <button
            id="add-todo-btn"
            onClick={() => setShowModal(true)}
            className={styles.addBtn}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tambah Tugas
          </button>
        )}

        {/* Tombol Refresh */}
        <button onClick={refreshTodos} className={styles.refreshBtn} title="Refresh">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </button>
      </div>

      {/* Daftar Todo */}
      <div className={styles.todoList}>
        {filteredTodos.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📝</div>
            <p>{search ? `Tidak ada tugas yang cocok dengan "${search}"` : 'Belum ada tugas. Tambahkan tugas pertama Anda!'}</p>
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              canModify={userCanModify}
              canApprove={userCanApprove}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))
        )}
      </div>

      {/* Modal tambah todo */}
      {showModal && (
        <AddTodoModal
          editingTodo={null}
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
          onUpdate={async (_id: number, _title: string) => {}}
        />
      )}
    </div>
  );
}
