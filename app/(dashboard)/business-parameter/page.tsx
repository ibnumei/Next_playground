import styles from '../sub-page.module.css';

/** Halaman Business Parameter (placeholder) */
export default function BusinessParameterPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.icon}>⚙️</div>
        <div>
          <h1 className={styles.title}>Business Parameter</h1>
          <p className={styles.subtitle}>Konfigurasi parameter bisnis dan aturan sistem.</p>
        </div>
      </div>
      <div className={styles.comingSoon}>
        <span className={styles.badge}>Coming Soon</span>
        <p>Fitur ini sedang dalam pengembangan.</p>
      </div>
    </div>
  );
}
