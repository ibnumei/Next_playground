import styles from '../sub-page.module.css';

/** Halaman Role Management (placeholder) */
export default function RolePage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.icon}>🛡️</div>
        <div>
          <h1 className={styles.title}>Role Management</h1>
          <p className={styles.subtitle}>Kelola peran dan hak akses pengguna dalam sistem.</p>
        </div>
      </div>
      <div className={styles.comingSoon}>
        <span className={styles.badge}>Coming Soon</span>
        <p>Fitur ini sedang dalam pengembangan.</p>
      </div>
    </div>
  );
}
