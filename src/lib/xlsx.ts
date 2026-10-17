import { type InferRow, type ParseOptions, parseFile, type Row, type RowError, type Schema } from "web-xlsx";
import { build } from "web-xlsx/write";
import { fileErrorMessage } from "./fileError";

// 読み書きで utc を揃えないと往復で日付がずれる
// JSON に出る Date は toISOString（UTC）なので UTC に揃える
const UTC = true;

export const DEFAULT_SHEET_NAME = "Sheet1";

export type ReadResult =
  | { ok: true; rows: Record<string, unknown>[]; errors: RowError[] }
  | { ok: false; error: string };

export type WriteResult = { ok: true; data: Uint8Array } | { ok: false; error: string };

/**
 * xlsx ファイルを読み、エラーを日本語のメッセージにして返す
 *
 * @param file - 読む xlsx
 * @param options - シートやヘッダー行の指定
 * @param schema - 指定すると列を検証して型付けする
 * @returns 読めた行と行単位のエラー、またはファイル単位のエラー
 */
export async function readXlsx(file: Blob, options: ParseOptions, schema?: Schema): Promise<ReadResult> {
  const withUtc = { ...options, utc: UTC };
  const result = schema
    ? await parseFile(file, { schema, options: withUtc })
    : await parseFile(file, { options: withUtc });
  if (!result.ok) return { ok: false, error: fileErrorMessage(result.error.code) };
  return { ok: true, rows: result.data, errors: result.errors };
}

/**
 * 行を xlsx のバイト列に書き出す
 *
 * @param rows - スキーマ付きなら parseJsonRows で同じスキーマの型に検証済みの行
 * @param sheetName - シート名
 * @param schema - 指定すると列順とヘッダーをスキーマで決める
 * @returns xlsx のバイト列、またはエラー
 */
export async function writeXlsx(rows: Row[], sheetName: string, schema?: Schema): Promise<WriteResult> {
  const options = { sheetName, utc: UTC };
  const result = schema ? await build(rows as InferRow<Schema>[], { schema, options }) : await build(rows, { options });
  if (!result.ok) return { ok: false, error: fileErrorMessage(result.error.code) };
  return { ok: true, data: result.data };
}
