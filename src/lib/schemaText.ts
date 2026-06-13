import type { Column, ColumnType, Schema } from "web-xlsx";

const TYPES: ColumnType[] = ["string", "number", "boolean", "date"];

export type SchemaParseResult = { ok: true; schema: Schema } | { ok: false; error: string };

// テキスト（JSON）を Schema として読み、最低限の妥当性を検証する
export function parseSchemaText(text: string): SchemaParseResult {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "スキーマが空です。" };

  let raw: unknown;
  try {
    raw = JSON.parse(trimmed);
  } catch (e) {
    return { ok: false, error: `JSON として読めません: ${(e as Error).message}` };
  }

  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return { ok: false, error: "オブジェクト（ヘッダー名 → 列定義）で書いてください。" };
  }

  const schema: Record<string, Column> = {};
  for (const [header, def] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof def !== "object" || def === null) {
      return { ok: false, error: `${header}: 列定義はオブジェクトにしてください。` };
    }
    const d = def as Record<string, unknown>;
    if (typeof d.prop !== "string" || d.prop === "") {
      return { ok: false, error: `${header}: prop（出力プロパティ名）が必要です。` };
    }
    if (typeof d.type !== "string" || !TYPES.includes(d.type as ColumnType)) {
      return { ok: false, error: `${header}: type は ${TYPES.join(" / ")} のいずれかです。` };
    }
    schema[header] = d as unknown as Column;
  }

  return { ok: true, schema: schema as Schema };
}

// スキーマ欄に入れる雛形
export const SAMPLE_SCHEMA = `{
  "名前": { "prop": "name", "type": "string", "required": true },
  "年齢": { "prop": "age", "type": "number" },
  "入社日": { "prop": "hireDate", "type": "date" }
}`;
