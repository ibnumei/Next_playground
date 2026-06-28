import { create } from 'zustand';
import { Todo, MenuItem, UserInfo } from '@/lib/api';

/**
 * Interface yang mendefinisikan struktur state dan actions di Zustand store.
 * Mencakup state auth (token, user info, role, menus) dan state todos.
 */
interface AppStore {
  // State auth
  token: string | null;
  user: UserInfo | null;
  menus: MenuItem[];
  isLoading: boolean;
  error: string | null;

  // State todos
  todos: Todo[];

  // Actions untuk auth
  setAuth: (token: string, user: UserInfo, menus: MenuItem[]) => void;
  clearAuth: () => void;

  // Actions untuk todos
  setTodos: (todos: Todo[]) => void;
  addTodo: (todo: Todo) => void;
  updateTodo: (todo: Todo) => void;
  removeTodo: (id: number) => void;

  // State helpers
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Computed helpers
  canModify: () => boolean;
  canApprove: () => boolean;
}

/**
 * Zustand store untuk mengelola state global: autentikasi RBAC dan daftar todos.
 */
export const useAppStore = create<AppStore>((set, get) => ({
  // Initial state
  token: null,
  user: null,
  menus: [],
  todos: [],
  isLoading: false,
  error: null,

  /**
   * Menyimpan token, info user, dan daftar menu setelah login berhasil.
   */
  setAuth: (token, user, menus) => set({ token, user, menus }),

  /**
   * Menghapus seluruh auth state saat logout.
   */
  clearAuth: () => set({ token: null, user: null, menus: [], todos: [] }),

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

  /**
   * Helper: mengecek apakah user saat ini memiliki izin modifikasi (can_modify).
   * Berdasarkan role: Maker = true, Checker = true, Viewer = false.
   */
  canModify: () => {
    const { user } = get();
    return user?.role === 'Maker';
  },

  /**
   * Helper: mengecek apakah user saat ini memiliki izin approval (can_approve).
   * Berdasarkan role: Checker = true, yang lain = false.
   */
  canApprove: () => {
    const { user } = get();
    return user?.role === 'Checker';
  },
}));

// Re-export legacy alias untuk backward compat
export const useTodoStore = useAppStore;
