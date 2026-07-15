"use client";
import { useState } from "react";
import ServiceLayout from "./ServiceLayout";
import Terminal, { LogLine } from "./Terminal";
import styles from "./demos.module.css";

const BOOT = [
  "$ ./server  # or: uvicorn app.main:app",
  "webhook-dispatcher listening on :8082",
  "max_attempts=4  backoff_base=2s",
];

type DestKey = "discord" | "slack" | "generic";

const DESTINATIONS: {
  key: DestKey;
  name: string;
  format: string;
  icon: string;
}[] = [
  { key: "discord", name: "Discord", format: "embed format", icon: "💬" },
  { key: "slack", name: "Slack", format: "block kit", icon: "#" },
  { key: "generic", name: "Custom endpoint", format: "raw JSON", icon: "⬡" },
];

type DeliveryResult = {
  key: DestKey;
  name: string;
  attempts: number;
  success: boolean;
};

export default function WebhookDemo() {
  const [selected, setSelected] = useState<Set<DestKey>>(
    new Set(["discord", "slack"]),
  );
  const [eventType, setEventType] = useState("deploy.success");
  const [dispatching, setDispatching] = useState(false);
  const [results, setResults] = useState<DeliveryResult[]>([]);
  const [logs, setLogs] = useState<LogLine[]>([]);

  function toggle(key: DestKey) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function addLog(line: LogLine) {
    setLogs((prev) => [...prev.slice(-30), line]);
  }

  async function dispatch() {
    if (dispatching || selected.size === 0) return;
    setDispatching(true);
    setResults([]);

    const eventId =
      Math.random().toString(36).slice(2, 10) +
      Math.random().toString(36).slice(2, 6);
    addLog({
      text: `POST /dispatch ← ${selected.size} destination(s)`,
      type: "dim",
    });
    addLog({ text: `event_id: ${eventId}`, type: "info" });
    addLog({
      text: `spawning ${selected.size} goroutine(s) for fan-out`,
      type: "dim",
    });

    const pending = [...selected];
    const final: DeliveryResult[] = [];

    await Promise.all(
      pending.map(async (key, i) => {
        const dest = DESTINATIONS.find((d) => d.key === key)!;
        // stagger start slightly to make fan-out visible
        await sleep(i * 120);

        addLog({ text: `[${key}] formatting as ${dest.format}`, type: "dim" });
        await sleep(300);

        // slack gets a simulated first-attempt failure to show retries
        const needsRetry = key === "slack";
        if (needsRetry) {
          addLog({
            text: `[${key}] attempt 1 → 503  retrying in 2s`,
            type: "warn",
          });
          await sleep(1400);
          addLog({ text: `[${key}] attempt 2 → 200 OK`, type: "ok" });
        } else {
          addLog({ text: `[${key}] attempt 1 → 200 OK`, type: "ok" });
        }

        final.push({
          key,
          name: dest.name,
          attempts: needsRetry ? 2 : 1,
          success: true,
        });
        setResults([...final]);
      }),
    );

    setDispatching(false);
  }

  const left = (
    <div>
      <div className={styles.panelLabel}>COMPOSE EVENT</div>

      <div className={styles.fieldGroup}>
        <div className={styles.fieldLabel}>event_type</div>
        <input
          className={styles.fieldInput}
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
        />
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.fieldLabel}>payload</div>
        <textarea
          className={styles.fieldTextarea}
          rows={3}
          defaultValue={
            '{"service":"api","version":"2.1.0","env":"production"}'
          }
          readOnly
        />
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.fieldLabel}>destinations</div>
        <div className={styles.destList}>
          {DESTINATIONS.map((d) => {
            const on = selected.has(d.key);
            return (
              <div
                key={d.key}
                className={`${styles.destItem} ${on ? styles.destItemOn : ""}`}
                onClick={() => toggle(d.key)}
              >
                <span className={styles.destIcon}>{d.icon}</span>
                <span className={styles.destName}>{d.name}</span>
                <span className={styles.destFormat}>{d.format}</span>
                <div
                  className={`${styles.destCheck} ${on ? styles.destCheckOn : ""}`}
                >
                  {on && <span>✓</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        className={`${styles.btn} ${styles.btnPrimary}`}
        onClick={dispatch}
        disabled={dispatching || selected.size === 0}
      >
        {dispatching ? "Dispatching…" : "Dispatch event"}
      </button>

      {results.length > 0 && (
        <div className={styles.deliveryResults}>
          <div className={styles.fieldLabel} style={{ marginBottom: 6 }}>
            DELIVERY RESULTS
          </div>
          {results.map((r) => (
            <div key={r.key} className={styles.deliveryRow}>
              <span
                className={r.success ? styles.deliveryOk : styles.deliveryFail}
              >
                {r.success ? "✓" : "✗"}
              </span>
              <div className={styles.deliveryInfo}>
                <div className={styles.deliveryName}>{r.name}</div>
                <div className={styles.deliveryAttempts}>
                  {Array.from({ length: r.attempts }).map((_, i) => (
                    <span
                      key={i}
                      className={styles.attemptDot}
                      style={{
                        background:
                          i === r.attempts - 1 && r.success
                            ? "#6EE7B7"
                            : i < r.attempts - 1
                              ? "#F6E05E"
                              : "#FC8181",
                      }}
                    />
                  ))}
                  {r.attempts} attempt{r.attempts > 1 ? "s" : ""} ·{" "}
                  {r.success ? "delivered" : "failed"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const right = (
    <div>
      <div className={styles.panelLabel}>SERVER LOG</div>
      <Terminal lines={logs} boot={BOOT} />
      <div className={styles.jsonBlock} style={{ marginTop: 12 }}>
        <span className={styles.jKey}>"event_id"</span>:{" "}
        <span className={styles.jStr}>"ae36770ab967…"</span>,{"\n"}
        <span className={styles.jKey}>"results"</span>: [{"\n"}
        {"  "}
        <span className={styles.jKey}>"status"</span>:{" "}
        <span className={styles.jStr}>"success"</span>,{"\n"}
        {"  "}
        <span className={styles.jKey}>"attempts"</span>: [{"{"}
        <span className={styles.jKey}>"attempt_number"</span>:{" "}
        <span className={styles.jNum}>1</span>
        {"}"}]{"\n"}]
      </div>
    </div>
  );

  return (
    <ServiceLayout
      number="3"
      title="Webhook dispatcher"
      description="Fan-out to multiple destinations concurrently. Per-destination formatting (Discord embeds, Slack blocks, raw JSON), HMAC-SHA256 signing on every outgoing request, automatic retries with exponential backoff, delivery history queryable after the fact."
      badges={[
        { label: "Go", variant: "go" },
        { label: "Python", variant: "py" },
        { label: "POST /dispatch", variant: "success" },
        { label: "GET /events/{id}", variant: "success" },
      ]}
      flowLine={
        <>
          POST /dispatch → <span style={{ color: "#6EE7B7" }}>goroutines</span>{" "}
          × N → format (Discord/Slack/JSON) → sign (HMAC-SHA256) → deliver +
          retry → EventStore
        </>
      }
      left={left}
      right={right}
    />
  );
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
