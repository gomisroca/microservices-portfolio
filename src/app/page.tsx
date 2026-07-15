"use client";

import { useState } from "react";
import styles from "./page.module.css";
import ImageUploadDemo from "@/components/ImageUploadDemo";
import RateLimiterDemo from "@/components/RateLimiterDemo";
import WebhookDemo from "@/components/WebhookDemo";

const TABS = [
  { id: "upload", label: "image-upload", lang: "both" },
  { id: "ratelimit", label: "rate-limiter", lang: "both" },
  { id: "webhook", label: "webhook-dispatcher", lang: "both" },
];

export default function Home() {
  const [active, setActive] = useState("upload");

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.headerTitle}>microservices</span>
          <span className={styles.headerSub}>
            Go · Python · production-grade
          </span>
        </div>
      </header>

      <nav className={styles.nav}>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`${styles.navTab} ${active === t.id ? styles.navTabActive : ""}`}
            onClick={() => setActive(t.id)}
          >
            <LangDot lang={t.lang} />
            {t.label}
          </button>
        ))}
      </nav>

      <div className={styles.content}>
        {active === "upload" && <ImageUploadDemo />}
        {active === "ratelimit" && <RateLimiterDemo />}
        {active === "webhook" && <WebhookDemo />}
      </div>
    </main>
  );
}

function LangDot({ lang }: { lang: string }) {
  if (lang === "go") return <span className={styles.dotGo} />;
  if (lang === "py") return <span className={styles.dotPy} />;
  return (
    <>
      <span className={styles.dotGo} />
      <span className={styles.dotPy} style={{ marginLeft: -4 }} />
    </>
  );
}
