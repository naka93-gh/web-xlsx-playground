import type { RowError, RowErrorCode } from "web-xlsx";

const MESSAGES: Record<Exclude<RowErrorCode, "validate">, string> = {
  required: "必須の値が空です",
  "non-number": "数値ではありません",
  "non-boolean": "真偽値ではありません",
  "non-date": "日付ではありません",
};

/**
 * 行単位のエラーを位置付きの日本語メッセージにする
 *
 * @param error - web-xlsx が返した行単位のエラー
 * @returns 表示用のメッセージ
 */
export function rowErrorMessage(error: RowError): string {
  const place = error.column ? `${error.row}行目・${error.column}` : `${error.row}行目`;
  // validate のメッセージはスキーマ作者が書いた文言なのでそのまま出す
  const message = error.code === "validate" ? error.message : MESSAGES[error.code];
  return error.value === undefined ? `${place}: ${message}` : `${place}: ${message}（値: ${String(error.value)}）`;
}
