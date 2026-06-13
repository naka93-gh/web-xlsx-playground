import type { FileErrorCode } from "web-xlsx";

// web-xlsx の FileError コードを日本語メッセージに対応づける
const MESSAGES: Record<FileErrorCode, string> = {
  "not-zip": "xlsx（ZIP）として読めませんでした。ファイル形式を確認してください。",
  "invalid-xlsx": "xlsx の必要な構成要素が欠けています。",
  "sheet-not-found": "指定したシートが見つかりません。",
  "invalid-range": "range の指定形式が不正です（例: A1:D100）。",
  "invalid-option": "オプションまたはスキーマの指定が不正です。",
  "duplicate-header": "ヘッダーに同名の列があり、列を一意に対応づけられません。",
  "missing-column": "スキーマの必須列がヘッダーに見つかりません。",
  "unsupported-environment": "この環境は解凍（DecompressionStream）に未対応です。",
  "too-large": "解凍後のサイズが上限を超えています。",
  "read-failed": "ファイルの読み込みに失敗しました。",
};

export function fileErrorMessage(code: FileErrorCode): string {
  return MESSAGES[code] ?? "不明なエラーが発生しました。";
}
