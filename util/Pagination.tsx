'use client';

import { buildPageRange } from './pagination';
import styles from './Pagination.module.css';

/** Props yang dibutuhkan komponen Pagination */
export interface PaginationProps {
  /** Nomor halaman yang sedang aktif */
  currentPage: number;
  /** Total halaman terakhir */
  lastPage: number;
  /** Total keseluruhan data */
  total: number;
  /** Indeks baris pertama pada halaman ini (dari meta.from) */
  from: number;
  /** Indeks baris terakhir pada halaman ini (dari meta.to) */
  to: number;
  /** Callback saat user berpindah ke halaman tertentu */
  onPageChange: (page: number) => void;
  /** ID prefix untuk tombol-tombol pagination (opsional, default: 'page') */
  idPrefix?: string;
}

/**
 * Komponen Pagination yang dapat digunakan kembali di seluruh halaman.
 *
 * Menampilkan:
 * - Informasi range data yang sedang ditampilkan
 * - Tombol « (halaman pertama), ‹ (sebelumnya), nomor halaman, › (berikutnya), » (halaman terakhir)
 * - Ellipsis otomatis untuk daftar halaman yang panjang
 *
 * @example
 * <Pagination
 *   currentPage={currentPage}
 *   lastPage={meta.last_page}
 *   total={meta.total}
 *   from={meta.from}
 *   to={meta.to}
 *   onPageChange={handlePageChange}
 * />
 */
export default function Pagination({
  currentPage,
  lastPage,
  total,
  from,
  to,
  onPageChange,
  idPrefix = 'page',
}: PaginationProps) {
  const pageRange = buildPageRange(currentPage, lastPage);

  return (
    <div className={styles.pagination}>
      {/* Info jumlah data */}
      <span className={styles.paginationInfo}>
        {total === 0
          ? 'Tidak ada data'
          : `Menampilkan ${from}–${to} dari ${total} data`}
      </span>

      <div className={styles.paginationControls}>
        {/* « First */}
        <button
          id={`${idPrefix}-first-btn`}
          className={styles.pageBtn}
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          aria-label="Halaman pertama"
          title="Halaman pertama"
        >
          «
        </button>

        {/* ‹ Prev */}
        <button
          id={`${idPrefix}-prev-btn`}
          className={styles.pageBtn}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Halaman sebelumnya"
          title="Halaman sebelumnya"
        >
          ‹
        </button>

        {/* Nomor halaman */}
        {pageRange.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className={styles.pageEllipsis}>…</span>
          ) : (
            <button
              key={p}
              id={`${idPrefix}-btn-${p}`}
              className={`${styles.pageBtn} ${p === currentPage ? styles.pageBtnActive : ''}`}
              onClick={() => onPageChange(p as number)}
              aria-current={p === currentPage ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        {/* › Next */}
        <button
          id={`${idPrefix}-next-btn`}
          className={styles.pageBtn}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
          aria-label="Halaman berikutnya"
          title="Halaman berikutnya"
        >
          ›
        </button>

        {/* » Last */}
        <button
          id={`${idPrefix}-last-btn`}
          className={styles.pageBtn}
          onClick={() => onPageChange(lastPage)}
          disabled={currentPage >= lastPage}
          aria-label="Halaman terakhir"
          title="Halaman terakhir"
        >
          »
        </button>
      </div>
    </div>
  );
}
