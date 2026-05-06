import { create } from 'zustand';
import { Todo } from '@/lib/api';

/**
 * Interface yang mendefinisikan struktur state dan actions di Zustand store.
 */
interface TodoStore {
  // State
  todos: Todo[];
  token: string | null;
  username: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions untuk auth
  setAuth: (token: string, username: string) => void;
  clearAuth: () => void;

  // Actions untuk todos
  setTodos: (todos: Todo[]) => void;
  addTodo: (todo: Todo) => void;
  updateTodo: (todo: Todo) => void;
  removeTodo: (id: number) => void;

  // State helpers
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * Zustand store untuk mengelola state global: autentikasi dan daftar todos.
 */
export const useTodoStore = create<TodoStore>((set) => ({
  // Initial state
  todos: [],
  token: null,
  username: null,
  isLoading: false,
  error: null,

  /**
   * Menyimpan token dan username setelah login berhasil.
   */
  setAuth: (token, username) => set({ token, username }),

  /**
   * Menghapus auth state saat logout.
   */
  clearAuth: () => set({ token: null, username: null, todos: [] }),

  /**
   * Mengganti seluruh daftar todos dengan data baru dari API.
   */
  setTodos: (todos) => set({ todos }),

  /**
   * Menambahkan todo baru ke awal daftar (urutan terbaru duluan).
   */
  addTodo: (todo) => set((state) => ({ todos: [todo, ...state.todos] })),

  /**
   * Mengupdate satu todo yang sudah ada berdasarkan id.
   */
  updateTodo: (todo) =>
    set((state) => ({
      todos: state.todos.map((t) => (t.id === todo.id ? todo : t)),
    })),

  /**
   * Menghapus todo dari state berdasarkan id.
   */
  removeTodo: (id) =>
    set((state) => ({ todos: state.todos.filter((t) => t.id !== id) })),

  /**
   * Mengatur state loading untuk menampilkan spinner.
   */
  setLoading: (isLoading) => set({ isLoading }),

  /**
   * Mengatur pesan error untuk ditampilkan ke user.
   */
  setError: (error) => set({ error }),
}));
