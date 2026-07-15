import styles from "./ServiceLayout.module.css";

interface Badge {
  label: string;
  variant?: "go" | "py" | "success" | "default";
}

interface Props {
  number: string;
  title: string;
  description: string;
  badges: Badge[];
  flowLine: React.ReactNode;
  left: React.ReactNode;
  right: React.ReactNode;
}

export default function ServiceLayout({
  number,
  title,
  description,
  badges,
  flowLine,
  left,
  right,
}: Props) {
  return (
    <div className={styles.wrap}>
      <div className={styles.hero}>
        <div className={styles.serviceLabel}>service {number} / 3</div>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.desc}>{description}</p>
        <div className={styles.badges}>
          {badges.map((b, i) => (
            <span
              key={i}
              className={`${styles.badge} ${b.variant ? styles["badge_" + b.variant] : ""}`}
            >
              {b.label}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.twoCol}>
        <div className={styles.panel}>{left}</div>
        <div className={styles.panel}>{right}</div>
      </div>
      <div className={styles.flowLine}>{flowLine}</div>
    </div>
  );
}
