'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/todoStore';
import { fetchUsersApi, UserRecord, UserFilters, PaginationMeta } from '@/lib/api';
import Pagination from '@/util/Pagination';
import styles from './user.module.css';



/**
 * Halaman User Management.
 * Menampilkan panel filter dan tabel data user dengan paginasi (10 per halaman).
 */
export default function UserPage() {
  const { token } = useAppStore();

  // ── Filter state ──
  const [filterName,           setFilterName]           = useState('');
  const [filterEmail,          setFilterEmail]          = useState('');
  const [filterStatus,         setFilterStatus]         = useState('');
  const [filterApprovalStatus, setFilterApprovalStatus] = useState('');

  // ── Pagination & data state ──
  const [currentPage, setCurrentPage] = useState(1);
  const [users,       setUsers]       = useState<UserRecord[]>([]);
  const [meta,        setMeta]        = useState<PaginationMeta | null>(null);
  const [isLoading,   setIsLoading]   = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  // Filter yang sedang aktif (dikunci saat Search diklik)
  const [activeFilters, setActiveFilters] = useState<UserFilters>({});

  /**
   * Mengambil data user dari API berdasarkan filter aktif dan halaman saat ini.
   */
  const loadUsers = useCallback(async (filters: UserFilters, page: number) => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchUsersApi(token, filters, page);
      setUsers(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengambil data user.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Load semua user saat halaman pertama dibuka
  useEffect(() => {
    loadUsers({}, 1);
  }, [loadUsers]);

  /** Kunci filter aktif dan reset ke halaman 1, lalu fetch. */
  function handleSearch() {
    const filters: UserFilters = {
      name:            filterName            || undefined,
      email:           filterEmail           || undefined,
      status:          filterStatus          || undefined,
      approval_status: filterApprovalStatus  || undefined,
    };
    setActiveFilters(filters);
    setCurrentPage(1);
    loadUsers(filters, 1);
  }

  /** Reset semua filter, kembali ke halaman 1, tampilkan semua data. */
  function handleReset() {
    setFilterName('');
    setFilterEmail('');
    setFilterStatus('');
    setFilterApprovalStatus('');
    setActiveFilters({});
    setCurrentPage(1);
    loadUsers({}, 1);
  }

  /** Pindah ke halaman tertentu tanpa mengubah filter. */
  function handlePageChange(page: number) {
    if (page < 1 || (meta && page > meta.last_page)) return;
    setCurrentPage(page);
    loadUsers(activeFilters, page);
  }

  // ── Helpers ──
  function getStatusLabel(status: string)         { return status === 'A' ? 'Active' : status === 'I' ? 'Inactive' : status; }
  function getStatusBadgeClass(status: string)    { return status === 'A' ? styles.badgeActive : status === 'I' ? styles.badgeInactive : styles.badgeOther; }
  function getApprovalLabel(ap: string)           { return ap === 'APPROVED' ? 'Approved' : ap === 'WAITING_FOR_APPROVAL' ? 'Waiting For Approval' : ap; }
  function getApprovalBadgeClass(ap: string)      { return ap === 'APPROVED' ? styles.badgeApproved : ap === 'WAITING_FOR_APPROVAL' ? styles.badgeWaiting : styles.badgeOther; }

  const rowStart = meta ? meta.from : 0;

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.icon}>👥</div>
          <div>
            <h1 className={styles.title}>User Management</h1>
            <p className={styles.subtitle}>Kelola data pengguna dan akses sistem.</p>
          </div>
        </div>

        <button id="user-add-btn" className={styles.addBtn} onClick={() => {}}>
          <span className={styles.addIcon}>＋</span>
          Add User
        </button>
      </div>

      {/* ── Filter Panel ── */}
      <div className={styles.filterPanel}>
        <p className={styles.filterTitle}>🔍 Filter Pencarian</p>

        <div className={styles.filterGrid}>
          <div className={styles.filterField}>
            <label className={styles.filterLabel} htmlFor="filter-name">Name</label>
            <input
              id="filter-name"
              type="text"
              className={styles.filterInput}
              placeholder="Cari nama..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div className={styles.filterField}>
            <label className={styles.filterLabel} htmlFor="filter-email">Email</label>
            <input
              id="filter-email"
              type="text"
              className={styles.filterInput}
              placeholder="Cari email..."
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div className={styles.filterField}>
            <label className={styles.filterLabel} htmlFor="filter-status">Status</label>
            <select
              id="filter-status"
              className={styles.filterSelect}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">— Semua Status —</option>
              <option value="A">Active</option>
              <option value="I">Inactive</option>
            </select>
          </div>

          <div className={styles.filterField}>
            <label className={styles.filterLabel} htmlFor="filter-approval-status">Approval Status</label>
            <select
              id="filter-approval-status"
              className={styles.filterSelect}
              value={filterApprovalStatus}
              onChange={(e) => setFilterApprovalStatus(e.target.value)}
            >
              <option value="">— Semua Approval —</option>
              <option value="APPROVED">Approved</option>
              <option value="WAITING_FOR_APPROVAL">Waiting For Approval</option>
            </select>
          </div>
        </div>

        <div className={styles.filterActions}>
          <button id="user-reset-btn" className={styles.resetBtn} onClick={handleReset}>
            ↺ Reset
          </button>
          <button id="user-search-btn" className={styles.searchBtn} onClick={handleSearch}>
            🔍 Search
          </button>
        </div>
      </div>

      {/* ── Data Table ── */}
      <div className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>Daftar User</span>
          <span className={styles.tableCount}>
            {isLoading
              ? 'Memuat...'
              : meta
                ? `${meta.total} data ditemukan`
                : '0 data ditemukan'}
          </span>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>No</th>
                <th>Name / Email</th>
                <th>Status</th>
                <th>Approval Status</th>
                <th>Role</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr className={styles.stateRow}>
                  <td colSpan={6}>
                    <div className={styles.loadingSpinner}>
                      <div className={styles.spinner} />
                      Memuat data user...
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && error && (
                <tr className={styles.stateRow}>
                  <td colSpan={6}>
                    <div className={styles.errorState}>⚠ {error}</div>
                  </td>
                </tr>
              )}

              {!isLoading && !error && users.length === 0 && (
                <tr className={styles.stateRow}>
                  <td colSpan={6}>
                    <div className={styles.emptyState}>
                      <span className={styles.emptyIcon}>👤</span>
                      <span className={styles.emptyText}>Tidak ada data user yang ditemukan.</span>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && !error && users.map((user, index) => (
                <tr key={user.id}>
                  <td>{rowStart + index}</td>

                  <td>
                    <div className={styles.nameCell}>
                      <div className={styles.avatar}>{user.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className={styles.nameText}>{user.name}</div>
                        <div className={styles.emailText}>{user.email}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className={`${styles.badge} ${getStatusBadgeClass(user.status)}`}>
                      {getStatusLabel(user.status)}
                    </span>
                  </td>

                  <td>
                    <span className={`${styles.badge} ${getApprovalBadgeClass(user.approval_status)}`}>
                      {getApprovalLabel(user.approval_status)}
                    </span>
                  </td>

                  <td>
                    {user.role_name
                      ? <span className={styles.roleBadge}>{user.role_name}</span>
                      : <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem' }}>—</span>}
                  </td>

                  <td>
                    <button
                      id={`user-detail-btn-${user.id}`}
                      className={styles.detailBtn}
                      onClick={() => {}}
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Controls ── */}
        {meta && !isLoading && !error && (
          <Pagination
            currentPage={currentPage}
            lastPage={meta.last_page}
            total={meta.total}
            from={meta.from}
            to={meta.to}
            onPageChange={handlePageChange}
            idPrefix="user"
          />
        )}
      </div>

    </div>
  );
}

