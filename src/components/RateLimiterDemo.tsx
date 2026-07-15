"use client";

import { useState, useEffect, useRef } from "react";
import ServiceLayout from "./ServiceLayout";
import Terminal, { LogLine } from "./Terminal";
import styles from "./demos.module.css";

const BOOT = [
  "$ ./server  # or: uvicorn app.main:app",
  "rate-limiter-service listening on :8081",
  "capacity=10 window=60s  idle_ttl=600s",
];
const CAP = 10;

export default function RateLimiterDemo() {
  const [tokens, setTokens] = useState({ alice: CAP, bob: CAP });
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [reqs, setReqs] = useState<
    Array<{ key: string; allowed: boolean; remaining: number }>
  >([]);
  const refillRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function addLog(line: LogLine) {
    setLogs((prev) => [...prev.slice(-30), line]);
  }

  function sendReq(key: "alice" | "bob") {
    setTokens((prev) => {
      const allowed = prev[key] > 0;
      const next = { ...prev, [key]: allowed ? prev[key] - 1 : prev[key] };
      const remaining = next[key];
      addLog({
        text: `${allowed ? "allowed" : "DENIED  "} key=${key} remaining=${remaining}`,
        type: allowed ? "ok" : "err",
      });
      setReqs((r) => [{ key, allowed, remaining }, ...r].slice(0, 8));
      if (!refillRef.current) startRefill();
      return next;
    });
  }

  function sendBurst(key: "alice" | "bob") {
    for (let i = 0; i < 12; i++) setTimeout(() => sendReq(key), i * 60);
  }

  function startRefill() {
    refillRef.current = setInterval(() => {
      setTokens((prev) => {
        const next = { ...prev };
        let changed = false;
        for (const k of ["alice", "bob"] as const) {
          if (next[k] < CAP) {
            next[k] = Math.min(CAP, next[k] + 1);
            changed = true;
          }
        }
        if (changed)
          addLog({
            text: "refilled +1 token (continuous backfill)",
            type: "dim",
          });
        return next;
      });
    }, 5000);
  }

  useEffect(
    () => () => {
      if (refillRef.current) clearInterval(refillRef.current);
    },
    [],
  );

  const pct = (tokens.alice / CAP) * 100;
  const fillColor = pct <= 20 ? "#FC8181" : pct <= 50 ? "#F6E05E" : "#6EE7B7";

  const left = (
    <div>
      <div className={styles.panelLabel}>TOKEN BUCKET — alice</div>
      <div className={styles.bucketWrap}>
        <div className={styles.bucketOuter}>
          <div
            className={styles.bucketFill}
            style={{ height: `${pct}%`, background: fillColor }}
          />
        </div>
        <div>
          <div className={styles.tokenCount}>
            {tokens.alice}
            <span style={{ fontSize: 14, color: "var(--text-muted)" }}>
              /{CAP}
            </span>
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            tokens remaining
          </div>
        </div>
      </div>
      <div className={styles.ctrlRow}>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => sendReq("alice")}
        >
          Request — alice
        </button>
        <button className={styles.btn} onClick={() => sendBurst("alice")}>
          Burst ×12
        </button>
      </div>
      <div className={styles.ctrlRow} style={{ marginTop: 6 }}>
        <button className={styles.btn} onClick={() => sendReq("bob")}>
          Request — bob
        </button>
        <span
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          independent bucket
        </span>
      </div>
      <div className={styles.reqLog}>
        {reqs.map((r, i) => (
          <div key={i} className={styles.reqRow}>
            <span className={r.allowed ? styles.reqOk : styles.reqDeny}>
              {r.allowed ? "200" : "429"}
            </span>
            <span
              style={{
                color: "var(--text-muted)",
                fontSize: 12,
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              GET /check?key={r.key}
            </span>
            <span
              style={{
                marginLeft: "auto",
                fontSize: 11,
                color: "var(--text-muted)",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              {r.remaining} left
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const right = (
    <div>
      <div className={styles.panelLabel}>SERVER LOG</div>
      <Terminal lines={logs} boot={BOOT} />
      <div className={styles.jsonBlock} style={{ marginTop: 12 }}>
        <span className={styles.jKey}>"allowed"</span>:{" "}
        <span className={styles.jNum}>true</span>,{"\n"}
        <span className={styles.jKey}>"limit"</span>:{" "}
        <span className={styles.jNum}>10</span>,{"\n"}
        <span className={styles.jKey}>"remaining"</span>:{" "}
        <span className={styles.jNum}>9</span>,{"\n"}
        <span className={styles.jKey}>"resetAfterSeconds"</span>:{" "}
        <span className={styles.jNum}>0</span>
      </div>
    </div>
  );

  return (
    <ServiceLayout
      number="2"
      title="Rate limiter service"
      description="Token bucket per client key, lazily refilled from elapsed time — no per-key goroutine or background ticker. Available in Go and Python with identical HTTP contracts; swap one for the other without changing callers."
      badges={[
        { label: "Go", variant: "go" },
        { label: "Python", variant: "py" },
        { label: "zero deps" },
        { label: "go test -race ✓" },
        { label: "GET /check", variant: "success" },
        { label: "POST /check", variant: "success" },
      ]}
      flowLine={
        <>
          X-Client-Key → per-key bucket → lazily refilled → 200 or 429 +
          Retry-After →{" "}
          <span style={{ color: "#6EE7B7" }}>X-RateLimit-Remaining</span> header
        </>
      }
      left={left}
      right={right}
    />
  );
}
