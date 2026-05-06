/**
 * Helper untuk membaca token JWT dari cookie browser.
 * Mengembalikan string token atau null jika tidak ditemukan.
 */
export function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Helper untuk menyimpan token JWT ke cookie browser.
 * Cookie akan expired sesuai dengan TTL token (10 menit).
 */
export function setToken(token: string): void {
  // Simpan token di cookie selama 10 menit
  const expires = new Date(Date.now() + 10 * 60 * 1000).toUTCString();
  document.cookie = `token=${encodeURIComponent(token)}; path=/; expires=${expires}; SameSite=Lax`;
}

/**
 * Helper untuk menghapus token JWT dari cookie browser (logout).
 */
export function removeToken(): void {
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}
