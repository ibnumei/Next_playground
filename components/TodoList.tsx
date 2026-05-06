'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Todo, fetchTodosApi, createTodoApi, updateTodoApi, deleteTodoApi } from '@/lib/api';
import { getToken, removeToken } from '@/lib/auth';
import { useTodoStore } from '@/store/todoStore';
import TodoItem from './TodoItem';
import AddTodoModal from './AddTodoModal';
import styles from './TodoList.module.css';

interface TodoListProps {
  initialTodos: Todo[];
  token: string;
  serverError?: string;
}

/**
 * Komponen utama daftar Todo (Client Component).
 * Mengelola search, CRUD operations, dan menampilkan semua todos.
 */
export default function TodoList({ initialTodos, token, serverError }: TodoListProps) {
  const router = useRouter();
  const { todos, setTodos, addTodo, updateTodo, removeTodo, setAuth } = useTodoStore();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [error, setError] = useState(serverError || '');

  // Inisialisasi store dengan data awal dari server saat pertama mount
  useEffect(() => {
    setTodos(initialTodos);
    const savedToken = getToken();
    if (savedToken) {
      setAuth(savedToken, '');
    }
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
   * Refresh daftar todos dari API (digunakan setelah CUD operations).
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
   * Menambahkan todo baru via API dan mengupdate state lokal.
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
   * Mengupdate todo yang ada (judul atau status) via API.
   */
  async function handleUpdate(id: number, payload: Partial<{ title: string; is_completed: boolean }>) {
    try {
      const updated = await updateTodoApi(token, id, payload);
      updateTodo(updated);
      setError('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengupdate todo.';
      setError(msg);

      // Jika token expired (401), redirect ke login
      if (msg.includes('401') || msg.includes('Unauthenticated')) {
        handleLogout();
      }
    }
  }

  /**
   * Menghapus todo berdasarkan id via API.
   */
  async function handleDelete(id: number) {
    try {
      await deleteTodoApi(token, id);
      removeTodo(id);
      setError('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus todo.';
      setError(msg);
    }
  }

  /**
   * Logout: hapus token dari cookie dan redirect ke halaman login.
   */
  function handleLogout() {
    removeToken();
    router.push('/login');
  }

  // Hitung statistik todo
  const totalTodos = todos.length;
  const completedTodos = todos.filter((t) => t.is_completed).length;

  return (
    <div className={styles.container}>
      {/* Header dengan judul dan tombol logout */}
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
              {completedTodos} / {totalTodos} tugas selesai
            </p>
          </div>
        </div>
        <button id="logout-btn" onClick={handleLogout} className={styles.logoutBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>

      {/* Progress bar */}
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: totalTodos > 0 ? `${(completedTodos / totalTodos) * 100}%` : '0%' }}
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
        <button
          id="add-todo-btn"
          onClick={() => { setEditingTodo(null); setShowModal(true); }}
          className={styles.addBtn}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tambah Tugas
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
              onToggle={(id, val) => handleUpdate(id, { is_completed: val })}
              onEdit={(todo) => { setEditingTodo(todo); setShowModal(true); }}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Modal tambah/edit */}
      {showModal && (
        <AddTodoModal
          editingTodo={editingTodo}
          onClose={() => { setShowModal(false); setEditingTodo(null); }}
          onAdd={handleAdd}
          onUpdate={(id, title) => handleUpdate(id, { title })}
        />
      )}
    </div>
  );
}
