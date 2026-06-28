import styles from '../sub-page.module.css';

/** Halaman User Management (placeholder) */
export default function UserPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.icon}>👥</div>
        <div>
          <h1 className={styles.title}>User Management</h1>
          <p className={styles.subtitle}>Kelola data pengguna dan akses sistem.</p>
        </div>
      </div>
      <div className={styles.comingSoon}>
        <span className={styles.badge}>Coming Soon</span>
        <p>Fitur ini sedang dalam pengembangan.</p>
      </div>
    </div>
  );
}
