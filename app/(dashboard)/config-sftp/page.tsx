import styles from '../sub-page.module.css';

/** Halaman SFTP Config (placeholder) */
export default function ConfigSftpPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.icon}>🔗</div>
        <div>
          <h1 className={styles.title}>SFTP Config</h1>
          <p className={styles.subtitle}>Konfigurasi koneksi dan server SFTP.</p>
        </div>
      </div>
      <div className={styles.comingSoon}>
        <span className={styles.badge}>Coming Soon</span>
        <p>Fitur ini sedang dalam pengembangan.</p>
      </div>
    </div>
  );
}
