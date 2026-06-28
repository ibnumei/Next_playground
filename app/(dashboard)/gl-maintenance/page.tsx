import styles from '../sub-page.module.css';

/** Halaman GL Maintenance (placeholder) */
export default function GlMaintenancePage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.icon}>📒</div>
        <div>
          <h1 className={styles.title}>GL Maintenance</h1>
          <p className={styles.subtitle}>Kelola data General Ledger dan konfigurasi akuntansi.</p>
        </div>
      </div>
      <div className={styles.comingSoon}>
        <span className={styles.badge}>Coming Soon</span>
        <p>Fitur ini sedang dalam pengembangan.</p>
      </div>
    </div>
  );
}
