"use client";

import { useEffect, useRef } from "react";
import styles from "./Terminal.module.css";

export type LogLine = {
  text: string;
  type: "dim" | "ok" | "warn" | "err" | "info" | "url";
};

interface Props {
  lines: LogLine[];
  boot: string[];
}

export default function Terminal({ lines, boot }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [lines]);

  return (
    <div className={styles.terminal} ref={ref}>
      {boot.map((l, i) => (
        <div key={i} className={styles.dim}>
          {l}
        </div>
      ))}
      {lines.map((l, i) => (
        <div key={i} className={styles[l.type]}>
          {l.text}
        </div>
      ))}
      <div className={styles.dim}>▌</div>
    </div>
  );
}
