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

/**
 * Login ke API: mengirim username dan password, mendapatkan JWT token.
 */
export async function loginApi(username: string, password: string) {
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Login gagal.');
  }

  return data as { token: string; user: { id: number; username: string } };
}

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
 * Menambahkan todo baru ke API.
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

// Tipe Todo sesuai schema database
export interface Todo {
  id: number;
  user_id: number;
  title: string;
  is_completed: boolean;
  created_at: string;
}
