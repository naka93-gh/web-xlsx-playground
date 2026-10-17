import type { ReactElement } from "react";
/**
 * エラーメッセージを並べて表示する
 *
 * @param props - 表示するメッセージ
 * @returns メッセージの一覧（空なら何も描画しない）
 */
export function ErrorNotice({ messages }: { messages: string[] }): ReactElement | null {
  if (messages.length === 0) return null;
  return (
    <ul className="space-y-1 rounded-sm bg-red-50 px-3 py-2 text-sm text-red-600">
      {messages.map((m, i) => (
        <li key={i}>{m}</li>
      ))}
    </ul>
  );
}
