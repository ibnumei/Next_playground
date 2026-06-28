'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/todoStore';
import { removeToken } from '@/lib/auth';
import styles from './Sidebar.module.css';

/**
 * Komponen Sidebar dinamis yang merender menu hierarkis berdasarkan
 * hak akses RBAC user yang sedang login.
 * Menu diambil dari Zustand store yang diisi pada saat login.
 */
export default function Sidebar() {
  const { user, menus, clearAuth } = useAppStore();
  const pathname = usePathname();
  const router = useRouter();

  // State untuk expand/collapse menu induk
  const [expandedMenus, setExpandedMenus] = useState<Record<number, boolean>>(() => {
    // Buka menu yang memiliki sub menu aktif secara default
    const initial: Record<number, boolean> = {};
    menus.forEach((menu) => {
      if (menu.sub_menus.some((sm) => pathname.startsWith(sm.path))) {
        initial[menu.id] = true;
      }
    });
    return initial;
  });

  /**
   * Toggle expand/collapse menu induk (accordion).
   */
  function toggleMenu(menuId: number) {
    setExpandedMenus((prev) => ({ ...prev, [menuId]: !prev[menuId] }));
  }

  /**
   * Logout: hapus token dari cookie, bersihkan store, redirect ke login.
   */
  function handleLogout() {
    removeToken();
    clearAuth();
    router.push('/login');
  }

  /**
   * Menentukan warna badge berdasarkan nama role.
   */
  function getRoleBadgeClass(role: string | undefined) {
    if (role === 'Maker')   return styles.roleMaker;
    if (role === 'Checker') return styles.roleChecker;
    if (role === 'Viewer')  return styles.roleViewer;
    return styles.roleMaker;
  }

  return (
    <aside className={styles.sidebar}>
      {/* Header Sidebar: Logo + App Name */}
      <div className={styles.sidebarHeader}>
        <div className={styles.logoIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
        </div>
        <span className={styles.appName}>Todo RBAC</span>
      </div>

      {/* User Info Panel */}
      {user && (
        <div className={styles.userPanel}>
          <div className={styles.userAvatar}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user.name}</span>
            <span className={styles.userEmail}>{user.email}</span>
          </div>
          <span className={`${styles.roleBadge} ${getRoleBadgeClass(user.role)}`}>
            {user.role}
          </span>
        </div>
      )}

      {/* Navigation Menu Dinamis */}
      <nav className={styles.nav}>
        {menus.map((menu) => (
          <div key={menu.id} className={styles.menuGroup}>
            {/* Menu Induk */}
            {menu.can_expand ? (
              <button
                className={styles.menuHeader}
                onClick={() => toggleMenu(menu.id)}
                aria-expanded={expandedMenus[menu.id]}
              >
                <span className={styles.menuName}>{menu.name}</span>
                <svg
                  className={`${styles.chevron} ${expandedMenus[menu.id] ? styles.chevronOpen : ''}`}
                  width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            ) : (
              <div className={styles.menuHeaderStatic}>
                <span className={styles.menuName}>{menu.name}</span>
              </div>
            )}

            {/* Sub Menus */}
            {(!menu.can_expand || expandedMenus[menu.id]) && (
              <div className={styles.subMenuList}>
                {menu.sub_menus.map((sm) => {
                  const isActive = pathname === sm.path || pathname.startsWith(sm.path + '/');
                  return (
                    <Link
                      key={sm.id}
                      href={sm.path}
                      className={`${styles.subMenuItem} ${isActive ? styles.subMenuItemActive : ''}`}
                    >
                      <span className={styles.subMenuDot} />
                      <span>{sm.name}</span>
                      {/* Badge permission */}
                      <div className={styles.permBadges}>
                        {sm.can_modify && <span className={styles.permBadge} title="Can Modify">M</span>}
                        {sm.can_approve && <span className={`${styles.permBadge} ${styles.permApprove}`} title="Can Approve">A</span>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Logout Button */}
      <div className={styles.sidebarFooter}>
        <button id="logout-btn" onClick={handleLogout} className={styles.logoutBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}
