import type { Cell, Column, Row, Schema } from "web-xlsx";
import { errorMessage } from "./errorMessage";
import { parseIsoDate } from "./isoDate";
import { isPlainObject } from "./schemaText";

export type JsonRowsResult = { ok: true; rows: Row[] } | { ok: false; errors: string[] };

type Converted = { ok: true; row: Row } | { ok: false; errors: string[] };

/**
 * 入力された JSON を build に渡せる行にする
 *
 * build は Cell 以外の値を黙って String 化し、スキーマ付きでも型を検証しないので、ここで弾く
 *
 * @param text - JSON 欄に入力されたテキスト
 * @param schema - 指定すると prop で値を引き、列の型で検証する
 * @returns 変換した行、または全行分のエラー
 */
export function parseJsonRows(text: string, schema?: Schema): JsonRowsResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (e) {
    return { ok: false, errors: [`JSONとして読めません: ${errorMessage(e)}`] };
  }
  if (!Array.isArray(raw)) {
    return { ok: false, errors: ["オブジェクトの配列（例: [{...}, {...}]）で入力してください。"] };
  }

  const rows: Row[] = [];
  const errors: string[] = [];
  raw.forEach((item: unknown, i) => {
    const label = `${i + 1}件目`;
    if (!isPlainObject(item)) {
      errors.push(`${label}: オブジェクトではありません。`);
      return;
    }
    const converted = schema ? fromSchema(item, schema) : fromPlain(item);
    if (converted.ok) rows.push(converted.row);
    else errors.push(...converted.errors.map((e) => `${label}・${e}`));
  });
  return errors.length > 0 ? { ok: false, errors } : { ok: true, rows };
}

/**
 * 行を xlsx に書かれる形（キー = ヘッダー）に並べ直す
 *
 * @param rows - parseJsonRows が返した行
 * @param schema - parseJsonRows に渡したスキーマ
 * @returns ヘッダー名をキーにした行
 */
export function toSheetRows(rows: Row[], schema?: Schema): Row[] {
  if (!schema) return rows;
  const columns = Object.entries(schema);
  return rows.map((row) => Object.fromEntries(columns.map(([header, column]) => [header, row[column.prop] ?? null])));
}

/**
 * スキーマ無しの 1 件を行にする
 *
 * @param item - JSON 配列の 1 要素
 * @returns 行、またはキーごとのエラー
 */
function fromPlain(item: Record<string, unknown>): Converted {
  const cells: [string, Cell][] = [];
  const errors: string[] = [];
  for (const [key, value] of Object.entries(item)) {
    if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      cells.push([key, value]);
    } else {
      errors.push(`${key}: 文字列・数値・真偽値・null のいずれかにしてください。`);
    }
  }
  // "__proto__" などのキーを代入でなく自前のプロパティとして持たせる
  return errors.length > 0 ? { ok: false, errors } : { ok: true, row: Object.fromEntries(cells) };
}

/**
 * スキーマ付きの 1 件を行にする
 *
 * @param item - JSON 配列の 1 要素
 * @param schema - 値を引く prop と型を決めるスキーマ
 * @returns prop をキーにした行、または列ごとのエラー
 */
function fromSchema(item: Record<string, unknown>, schema: Schema): Converted {
  const cells: [string, Cell][] = [];
  const errors: string[] = [];
  for (const column of Object.values(schema)) {
    const cell = toCell(item[column.prop], column);
    if (typeof cell === "object" && cell !== null && "error" in cell) errors.push(`${column.prop}: ${cell.error}`);
    else cells.push([column.prop, cell]);
  }
  return errors.length > 0 ? { ok: false, errors } : { ok: true, row: Object.fromEntries(cells) };
}

/**
 * 値を列の型に合う Cell にする
 *
 * build の型は required 列を非 null とするので、読み取りと同じく空を弾く
 *
 * @param value - JSON の値
 * @param column - 値を入れる列の定義
 * @returns Cell、または型が合わない理由
 */
function toCell(value: unknown, column: Column): Cell | { error: string } {
  if (value === undefined || value === null || value === "") {
    return column.required ? { error: "必須の値が空です。" } : null;
  }
  switch (column.type) {
    case "string":
      return typeof value === "string" ? value : { error: "文字列ではありません。" };
    case "number":
      return typeof value === "number" ? value : { error: "数値ではありません。" };
    case "boolean":
      return typeof value === "boolean" ? value : { error: "真偽値ではありません。" };
    case "date":
      return (
        (typeof value === "string" && parseIsoDate(value)) || { error: "日付文字列（例: 2024-04-01）ではありません。" }
      );
  }
}
