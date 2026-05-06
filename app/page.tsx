import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

/**
 * Halaman root: mengecek token dari cookies dan redirect ke dashboard atau login.
 * Ini adalah Server Component — tidak ada JavaScript yang di-render ke client.
 */
export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  // Jika token ada, redirect ke dashboard; jika tidak, ke login
  if (token) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
