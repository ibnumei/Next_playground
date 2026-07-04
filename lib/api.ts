import { API_BASE_URL } from './config';

/**
 * Mengirim request ke Laravel API dengan header Authorization Bearer token.
 * Melempar error jika response tidak OK.
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  // Tambahkan Authorization header jika token tersedia
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string>),
    },
  });

  return response;
}

// ============================================================
// Type Definitions
// ============================================================

/** Tipe Sub Menu yang dikembalikan dalam daftar menu */
export interface SubMenuItem {
  id: number;
  code: string;
  name: string;
  path: string;
  can_view: boolean;
  can_modify: boolean;
  can_approve: boolean;
}

/** Tipe Menu induk yang berisi daftar sub menu */
export interface MenuItem {
  id: number;
  code: string;
  name: string;
  can_expand: boolean;
  menu_order: number;
  sub_menus: SubMenuItem[];
}

/** Tipe data user yang dikembalikan setelah login */
export interface UserInfo {
  id: number;
  name: string;
  email: string;
  role: string;
}

/** Tipe Todo sesuai schema database dengan status Maker-Checker */
export interface Todo {
  id: number;
  user_id: number;
  title: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  is_completed: boolean;
  created_at: string;
  user?: { id: number; name: string; email: string };
}

// ============================================================
// Auth API
// ============================================================

/**
 * Login ke API menggunakan email dan password.
 * Mengembalikan JWT token, data user, dan struktur menu yang dapat diakses.
 */
export async function loginApi(email: string, password: string) {
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Login gagal.');
  }

  return data as { token: string; user: UserInfo; menus: MenuItem[] };
}

// ============================================================
// Menu API
// ============================================================

/**
 * Mengambil hierarki menu berdasarkan role user yang sedang login.
 */
export async function fetchMenusApi(token: string) {
  const res = await apiFetch('/menus', { method: 'GET' }, token);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengambil menu.');
  return data as MenuItem[];
}

// ============================================================
// Todo API
// ============================================================

/**
 * Mengambil daftar todo dari API, dengan filter pencarian opsional.
 */
export async function fetchTodosApi(token: string, search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  const res = await apiFetch(`/todos${query}`, { method: 'GET' }, token);
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || 'Gagal mengambil todos.');
  return data as Todo[];
}

/**
 * Menambahkan todo baru ke API (hanya Maker dengan can_modify=true).
 */
export async function createTodoApi(token: string, title: string) {
  const res = await apiFetch('/todos', {
    method: 'POST',
    body: JSON.stringify({ title }),
  }, token);

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal menambah todo.');
  return data as Todo;
}

/**
 * Mengupdate todo berdasarkan id (title dan/atau is_completed).
 */
export async function updateTodoApi(
  token: string,
  id: number,
  payload: Partial<{ title: string; is_completed: boolean }>
) {
  const res = await apiFetch(`/todos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, token);

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengupdate todo.');
  return data as Todo;
}

/**
 * Menghapus todo berdasarkan id dari API.
 */
export async function deleteTodoApi(token: string, id: number) {
  const res = await apiFetch(`/todos/${id}`, { method: 'DELETE' }, token);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal menghapus todo.');
  return data;
}

/**
 * Menyetujui todo yang berstatus PENDING (hanya Checker dengan can_approve=true).
 */
export async function approveTodoApi(token: string, id: number) {
  const res = await apiFetch(`/todos/${id}/approve`, { method: 'POST' }, token);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal menyetujui todo.');
  return data as Todo;
}

/**
 * Menolak todo yang berstatus PENDING (hanya Checker dengan can_approve=true).
 */
export async function rejectTodoApi(token: string, id: number) {
  const res = await apiFetch(`/todos/${id}/reject`, { method: 'POST' }, token);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal menolak todo.');
  return data as Todo;
}

// ============================================================
// User API
// ============================================================

/** Tipe data user yang dikembalikan oleh endpoint GET /api/users */
export interface UserRecord {
  id: number;
  name: string;
  email: string;
  status: string;
  approval_status: string;
  role_name: string | null;
}

/** Meta informasi paginasi dari backend */
export interface PaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
}

/** Response paginasi yang mencakup data dan meta */
export interface PaginatedUsers {
  data: UserRecord[];
  meta: PaginationMeta;
}

/** Parameter filter opsional untuk pencarian user */
export interface UserFilters {
  name?: string;
  email?: string;
  status?: string;
  approval_status?: string;
}

/**
 * Mengambil daftar user dari API dengan filter opsional dan paginasi.
 * Filter yang kosong tidak akan dikirim ke backend.
 * @param page Nomor halaman (default: 1)
 */
export async function fetchUsersApi(token: string, filters?: UserFilters, page = 1) {
  const params = new URLSearchParams();

  if (filters?.name)            params.set('name', filters.name);
  if (filters?.email)           params.set('email', filters.email);
  if (filters?.status)          params.set('status', filters.status);
  if (filters?.approval_status) params.set('approval_status', filters.approval_status);
  params.set('page', String(page));

  const query = `?${params.toString()}`;
  const res   = await apiFetch(`/users${query}`, { method: 'GET' }, token);
  const data  = await res.json();

  if (!res.ok) throw new Error(data.message || 'Gagal mengambil data user.');
  return data as PaginatedUsers;
}
