import { type ReactElement, useEffect, useState } from "react";
import { Button } from "./Button";

const LABELS = { idle: "コピー", copied: "コピーしました", failed: "コピーできません" };

/**
 * クリップボードにコピーし、結果をしばらくラベルで知らせるボタン
 *
 * @param props - コピーするテキスト
 * @returns ボタン
 */
export function CopyButton({ text }: { text: string }): ReactElement {
  const [status, setStatus] = useState<keyof typeof LABELS>("idle");

  useEffect(() => {
    if (status === "idle") return;
    const timer = setTimeout(() => setStatus("idle"), 1500);
    return () => clearTimeout(timer);
  }, [status]);

  /**
   * テキストをコピーして状態を更新する
   */
  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }

  return <Button onClick={copy}>{LABELS[status]}</Button>;
}
