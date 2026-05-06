import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { fetchTodosApi, Todo } from '@/lib/api';
import TodoList from '@/components/TodoList';
import styles from './dashboard.module.css';

/**
 * Halaman Dashboard (Server Component).
 * Melakukan fetching awal daftar todo dari server menggunakan cookie token.
 * Kemudian merender client component TodoList dengan data awal.
 */
export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  // Redirect ke login jika token tidak ada (fallback dari middleware)
  if (!token) {
    redirect('/login');
  }

  let initialTodos: Todo[] = [];
  let fetchError = '';

  try {
    // Fetching todos dari server untuk initial render (SSR)
    initialTodos = await fetchTodosApi(token, '');
  } catch {
    fetchError = 'Gagal mengambil data todo. Silakan coba lagi.';
  }

  return (
    <main className={styles.main}>
      <TodoList
        initialTodos={initialTodos}
        token={token}
        serverError={fetchError}
      />
    </main>
  );
}
