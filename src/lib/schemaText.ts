import type { Column, ColumnType, Schema } from "web-xlsx";
import { errorMessage } from "./errorMessage";
import { parseIsoDate } from "./isoDate";

const TYPES: readonly ColumnType[] = ["string", "number", "boolean", "date"];
// validate は関数なので JSON では書けない
const KEYS = ["prop", "type", "required", "defaultValue"];

export type SchemaParseResult = { ok: true; schema: Schema } | { ok: false; error: string };

/**
 * テキスト（JSON）を Schema として読み、列定義の形と型を検証する
 *
 * @param text - スキーマ欄に入力された JSON
 * @returns 読めたスキーマ、または最初に見つかったエラー
 */
export function parseSchemaText(text: string): SchemaParseResult {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "スキーマが空です。" };

  let raw: unknown;
  try {
    raw = JSON.parse(trimmed);
  } catch (e) {
    return { ok: false, error: `JSONとして読めません: ${errorMessage(e)}` };
  }
  if (!isPlainObject(raw)) {
    return { ok: false, error: "オブジェクト（ヘッダー名 → 列定義）で書いてください。" };
  }

  const entries: [string, Column][] = [];
  const props = new Set<string>();
  for (const [header, def] of Object.entries(raw)) {
    const column = parseColumn(def);
    if (typeof column === "string") return { ok: false, error: `${header}: ${column}` };
    if (props.has(column.prop))
      return { ok: false, error: `${header}: prop「${column.prop}」が他の列と重複しています。` };
    props.add(column.prop);
    entries.push([header, column]);
  }
  // "__proto__" などのヘッダーを代入でなく自前のプロパティとして持たせる
  return { ok: true, schema: Object.fromEntries(entries) };
}

/**
 * 列定義を検証して Column にする
 *
 * @param def - 1 列分の定義
 * @returns 組み立てた列定義、または不正な理由
 */
function parseColumn(def: unknown): Column | string {
  if (!isPlainObject(def)) return "列定義はオブジェクトにしてください。";

  const unknownKey = Object.keys(def).find((key) => !KEYS.includes(key));
  if (unknownKey) return `未対応のキー「${unknownKey}」があります（使えるのは ${KEYS.join(" / ")}）。`;

  const { prop, type, required, defaultValue } = def;
  if (typeof prop !== "string" || prop === "") return "prop（出力プロパティ名）が必要です。";
  if (!isColumnType(type)) return `type は ${TYPES.join(" / ")} のいずれかです。`;
  if (required !== undefined && typeof required !== "boolean") return "required は true / false にしてください。";
  if (defaultValue === undefined) return { prop, type, required };

  switch (type) {
    case "string":
      return typeof defaultValue === "string"
        ? { prop, type, required, defaultValue }
        : "defaultValue は文字列にしてください。";
    case "number":
      return typeof defaultValue === "number"
        ? { prop, type, required, defaultValue }
        : "defaultValue は数値にしてください。";
    case "boolean":
      return typeof defaultValue === "boolean"
        ? { prop, type, required, defaultValue }
        : "defaultValue は true / false にしてください。";
    case "date": {
      // web-xlsx は date 列の defaultValue に Date を要求するが、JSON では文字列でしか書けない
      const date = typeof defaultValue === "string" ? parseIsoDate(defaultValue) : null;
      return date
        ? { prop, type, required, defaultValue: date }
        : "defaultValue は日付文字列（例: 2024-04-01）にしてください。";
    }
  }
}

/**
 * web-xlsx の列型か判定する
 *
 * @param value - 判定する値
 * @returns 列型なら true
 */
function isColumnType(value: unknown): value is ColumnType {
  return TYPES.includes(value as ColumnType);
}

/**
 * 配列でも null でもないオブジェクトか判定する
 *
 * @param value - 判定する値
 * @returns オブジェクトなら true
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
