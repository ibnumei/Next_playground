/**
 * Menghasilkan array nomor halaman yang ditampilkan di pagination controls.
 * Menerapkan logika ellipsis ("...") untuk daftar halaman yang panjang.
 *
 * Contoh output untuk 10 halaman, current = 5:
 *   [1, '...', 4, 5, 6, '...', 10]
 *
 * @param current Nomor halaman yang sedang aktif (dimulai dari 1)
 * @param last    Nomor halaman terakhir (total halaman)
 * @returns Array yang berisi nomor halaman dan/atau string '...' sebagai ellipsis
 */
export function buildPageRange(current: number, last: number): (number | '...')[] {
  // Jika halaman <= 7, tampilkan semua tanpa ellipsis
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);

  const pages: (number | '...')[] = [1];

  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end   = Math.min(last - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < last - 2) pages.push('...');

  pages.push(last);
  return pages;
}
