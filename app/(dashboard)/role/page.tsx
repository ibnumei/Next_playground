'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useAppStore } from '@/store/todoStore';
import { fetchRolesApi, RoleRecord, RoleFilters, PaginationMeta } from '@/lib/api';
import Pagination from '@/util/Pagination';
import styles from './role.module.css';

/**
 * Halaman Role Management.
 * Menampilkan panel filter dan tabel data role dengan paginasi (10 per halaman).
 *
 * Tombol "Add Role" hanya ditampilkan jika user yang login memiliki
 * can_modify = true pada sub menu ROLE (dari ROLE_SUB_MENU).
 */
function RolePageContent() {
  const { token, menus } = useAppStore();

  // ── Hitung permission can_modify untuk sub menu ROLE dari store ──
  // menus sudah berisi data dari ROLE_SUB_MENU berdasarkan role user yang login
  const roleSubMenuPermission = menus
    .flatMap((m) => m.sub_menus)
    .find((sm) => sm.code === 'ROLE');
  const canModify = roleSubMenuPermission?.can_modify === true;

  // ── Filter state ──
  const [filterName,   setFilterName]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // ── Pagination & data state ──
  const [currentPage, setCurrentPage] = useState(1);
  const [roles,       setRoles]       = useState<RoleRecord[]>([]);
  const [meta,        setMeta]        = useState<PaginationMeta | null>(null);
  const [isLoading,   setIsLoading]   = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  // Filter yang sedang aktif (dikunci saat Search diklik)
  const [activeFilters, setActiveFilters] = useState<RoleFilters>({});

  /**
   * Mengambil data role dari API berdasarkan filter aktif dan halaman saat ini.
   */
  const loadRoles = useCallback(async (filters: RoleFilters, page: number) => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchRolesApi(token, filters, page);
      setRoles(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengambil data role.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Load semua role saat halaman pertama dibuka
  useEffect(() => {
    loadRoles({}, 1);
  }, [loadRoles]);

  /** Kunci filter aktif dan reset ke halaman 1, lalu fetch. */
  function handleSearch() {
    const filters: RoleFilters = {
      name:   filterName   || undefined,
      status: filterStatus || undefined,
    };
    setActiveFilters(filters);
    setCurrentPage(1);
    loadRoles(filters, 1);
  }

  /** Reset semua filter, kembali ke halaman 1, tampilkan semua data. */
  function handleReset() {
    setFilterName('');
    setFilterStatus('');
    setActiveFilters({});
    setCurrentPage(1);
    loadRoles({}, 1);
  }

  /** Pindah ke halaman tertentu tanpa mengubah filter. */
  function handlePageChange(page: number) {
    if (page < 1 || (meta && page > meta.last_page)) return;
    setCurrentPage(page);
    loadRoles(activeFilters, page);
  }

  // ── Helpers ──
  function getStatusLabel(status: string)      { return status === 'A' ? 'Active' : status === 'I' ? 'Inactive' : status; }
  function getStatusBadgeClass(status: string) { return status === 'A' ? styles.badgeActive : status === 'I' ? styles.badgeInactive : styles.badgeOther; }
  function getApprovalLabel(ap: string)        { return ap === 'APPROVED' ? 'Approved' : ap === 'WAITING_FOR_APPROVAL' ? 'Waiting For Approval' : ap; }
  function getApprovalBadgeClass(ap: string)   { return ap === 'APPROVED' ? styles.badgeApproved : ap === 'WAITING_FOR_APPROVAL' ? styles.badgeWaiting : styles.badgeOther; }

  const rowStart = meta ? meta.from : 0;

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.icon}>🛡️</div>
          <div>
            <h1 className={styles.title}>Role Management</h1>
            <p className={styles.subtitle}>Kelola peran dan hak akses pengguna dalam sistem.</p>
          </div>
        </div>

        {/*
          Tombol Add Role hanya ditampilkan jika can_modify = true pada sub menu ROLE.
          Permission diambil dari store (data ROLE_SUB_MENU yang sudah di-load saat login).
        */}
        {canModify && (
          <button
            id="role-add-btn"
            className={styles.addBtn}
            onClick={() => {/* TODO: navigasi ke halaman add role */}}
          >
            <span className={styles.addIcon}>＋</span>
            Add Role
          </button>
        )}
      </div>

      {/* ── Filter Panel ── */}
      <div className={styles.filterPanel}>
        <p className={styles.filterTitle}>🔍 Filter Pencarian</p>

        <div className={styles.filterGrid}>
          <div className={styles.filterField}>
            <label className={styles.filterLabel} htmlFor="filter-role-name">Name</label>
            <input
              id="filter-role-name"
              type="text"
              className={styles.filterInput}
              placeholder="Cari nama role..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div className={styles.filterField}>
            <label className={styles.filterLabel} htmlFor="filter-role-status">Status</label>
            <select
              id="filter-role-status"
              className={styles.filterSelect}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">— Semua Status —</option>
              <option value="A">Active</option>
              <option value="I">Inactive</option>
            </select>
          </div>
        </div>

        <div className={styles.filterActions}>
          <button id="role-reset-btn" className={styles.resetBtn} onClick={handleReset}>
            ↺ Reset
          </button>
          <button id="role-search-btn" className={styles.searchBtn} onClick={handleSearch}>
            🔍 Search
          </button>
        </div>
      </div>

      {/* ── Data Table ── */}
      <div className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>Daftar Role</span>
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
                <th>Name</th>
                <th>Status</th>
                <th>Approval Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr className={styles.stateRow}>
                  <td colSpan={5}>
                    <div className={styles.loadingSpinner}>
                      <div className={styles.spinner} />
                      Memuat data role...
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && error && (
                <tr className={styles.stateRow}>
                  <td colSpan={5}>
                    <div className={styles.errorState}>⚠ {error}</div>
                  </td>
                </tr>
              )}

              {!isLoading && !error && roles.length === 0 && (
                <tr className={styles.stateRow}>
                  <td colSpan={5}>
                    <div className={styles.emptyState}>
                      <span className={styles.emptyIcon}>🛡️</span>
                      <span className={styles.emptyText}>Tidak ada data role yang ditemukan.</span>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && !error && roles.map((role, index) => (
                <tr key={role.id}>
                  <td>{rowStart + index}</td>

                  <td>
                    <div className={styles.roleNameCell}>
                      <div className={styles.roleAvatar}>{role.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className={styles.roleNameText}>{role.name}</div>
                        {role.description && (
                          <div className={styles.roleDescText}>{role.description}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className={`${styles.badge} ${getStatusBadgeClass(role.status)}`}>
                      {getStatusLabel(role.status)}
                    </span>
                  </td>

                  <td>
                    <span className={`${styles.badge} ${getApprovalBadgeClass(role.approval_status)}`}>
                      {getApprovalLabel(role.approval_status)}
                    </span>
                  </td>

                  <td>
                    <button
                      id={`role-detail-btn-${role.id}`}
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
            idPrefix="role"
          />
        )}
      </div>

    </div>
  );
}

export default function RolePage() {
  return (
    <Suspense>
      <RolePageContent />
    </Suspense>
  );
}
