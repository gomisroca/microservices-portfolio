"use client";

import { useState } from "react";
import ServiceLayout from "./ServiceLayout";
import Terminal, { LogLine } from "./Terminal";
import styles from "./demos.module.css";

const BOOT = [
  "$ ./server",
  "image-upload-service listening on :8080",
  "storage backend: s3 (Cloudflare R2)",
];

const STEPS = [
  {
    pct: 15,
    label: "Validating request…",
    log: "POST /upload ← multipart/form-data (1.2 MB)",
    type: "dim" as const,
  },
  {
    pct: 30,
    label: "Rate limit check…",
    log: "rate check → allowed (remaining: 7)",
    type: "ok" as const,
  },
  {
    pct: 50,
    label: "Decoding image…",
    log: "decoded 1200×800 PNG",
    type: "info" as const,
  },
  {
    pct: 65,
    label: "Spawning goroutines…",
    log: "spawning 2 goroutines for thumbnails",
    type: "dim" as const,
  },
  {
    pct: 78,
    label: "Generating thumbnails in parallel…",
    log: "goroutine[0] → small 150×100",
    type: "dim" as const,
  },
  {
    pct: 82,
    label: "Generating thumbnails in parallel…",
    log: "goroutine[1] → medium 500×333",
    type: "dim" as const,
  },
  {
    pct: 92,
    label: "Storing to R2…",
    log: "PutObject c7fb…_original.png → OK",
    type: "ok" as const,
  },
  {
    pct: 100,
    label: "Done",
    log: "201 Created — id: c7fbf6575fcc839f",
    type: "ok" as const,
  },
];

export default function ImageUploadDemo() {
  const [phase, setPhase] = useState<"idle" | "uploading" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [logs, setLogs] = useState<LogLine[]>([]);

  function addLog(line: LogLine) {
    setLogs((prev) => [...prev, line]);
  }

  function runUpload() {
    if (phase === "uploading") return;
    setPhase("uploading");
    setProgress(0);
    setLogs([]);

    STEPS.forEach((step, i) => {
      setTimeout(() => {
        setProgress(step.pct);
        setProgressLabel(step.label);
        addLog({ text: step.log, type: step.type });
        if (i === STEPS.length - 1) setPhase("done");
      }, i * 420);
    });
  }

  function reset() {
    setPhase("idle");
    setProgress(0);
    setLogs([]);
  }

  const left = (
    <div>
      <div className={styles.panelLabel}>TRY IT</div>
      {phase === "idle" && (
        <div className={styles.dropZone} onClick={runUpload}>
          <div className={styles.dropIcon}>↑</div>
          <div className={styles.dropText}>
            Drop an image or click to upload
          </div>
          <div className={styles.dropSub}>JPEG · PNG · max 10 MB</div>
        </div>
      )}
      {phase === "uploading" && (
        <div>
          <div className={styles.progressLabel}>{progressLabel}</div>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      {phase === "done" && (
        <>
          <div className={styles.thumbGrid}>
            {[
              {
                label: "original",
                size: "1200×800",
                hue: "135deg,#6EE7B730,#90CDF430",
              },
              {
                label: "medium",
                size: "500×333",
                hue: "135deg,#90CDF430,#B794F430",
              },
              {
                label: "small",
                size: "150×100",
                hue: "135deg,#B794F430,#6EE7B730",
              },
            ].map((t) => (
              <div key={t.label} className={styles.thumbCard}>
                <div
                  className={styles.thumbImg}
                  style={{ background: `linear-gradient(${t.hue})` }}
                />
                <div className={styles.thumbLabel}>
                  {t.label} · {t.size}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.jsonBlock}>
            <span className={styles.jKey}>"id"</span>:{" "}
            <span className={styles.jStr}>"c7fbf6575fcc839f"</span>,{"\n"}
            <span className={styles.jKey}>"thumbnails"</span>:{"{"}
            <span className={styles.jKey}>"small"</span>:{" "}
            <span className={styles.jStr}>"/files/…_small.jpg"</span>,
            <span className={styles.jKey}>"medium"</span>:{" "}
            <span className={styles.jStr}>"/files/…_medium.jpg"</span>
            {"}"}
          </div>
          <button className={styles.resetBtn} onClick={reset}>
            Upload another
          </button>
        </>
      )}
    </div>
  );

  const right = (
    <div>
      <div className={styles.panelLabel}>SERVER LOG</div>
      <Terminal lines={logs} boot={BOOT} />
      <div className={styles.envBlock}>
        <div>
          <span className={styles.envKey}>STORAGE_BACKEND</span>=s3
        </div>
        <div>
          <span className={styles.envKey}>S3_ENDPOINT</span>
          =https://…r2.cloudflarestorage.com
        </div>
        <div>
          <span className={styles.envKey}>RATELIMITER_URL</span>
          =http://ratelimiter:8081
        </div>
      </div>
    </div>
  );

  return (
    <ServiceLayout
      number="1"
      title="Image upload service"
      description="Accepts image uploads, generates thumbnails concurrently via goroutines, stores originals and thumbnails to Cloudflare R2 or AWS S3. Zero imaging dependencies — pure Go standard library."
      badges={[
        { label: "Go", variant: "go" },
        { label: "zero imaging deps" },
        { label: "aws-sdk-go-v2" },
        { label: "POST /upload", variant: "success" },
        { label: "GET /files/{key}", variant: "success" },
      ]}
      flowLine={
        <>
          POST /upload → rate-limit check → decode →{" "}
          <span style={{ color: "#6EE7B7" }}>goroutines</span> × 2 thumbnails →
          R2 PutObject → /files/{"{"}
          <span style={{ color: "#B794F4" }}>key</span>
          {"}"} redirect
        </>
      }
      left={left}
      right={right}
    />
  );
}
