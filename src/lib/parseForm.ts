import type { ParseOptions } from "web-xlsx";

export type ParseForm = {
  sheetBy: "index" | "name";
  sheet: string;
  headerRow: string;
};

export const INITIAL_PARSE_FORM: ParseForm = { sheetBy: "index", sheet: "", headerRow: "" };

export type ParseOptionsResult = { ok: true; options: ParseOptions } | { ok: false; error: string };

/**
 * 読み込み設定のフォーム入力を ParseOptions にする
 *
 * @param form - フォームの入力値
 * @returns 組み立てたオプション、または入力の誤り
 */
export function toParseOptions(form: ParseForm): ParseOptionsResult {
  const options: ParseOptions = {};

  const sheet = form.sheet.trim();
  if (sheet && form.sheetBy === "name") {
    options.sheet = sheet;
  } else if (sheet) {
    const index = parsePositiveInt(sheet);
    if (index === null) return { ok: false, error: "シート番号は1以上の整数で指定してください。" };
    // web-xlsx のシート番号は0始まりだが、ヘッダー行と揃えて UI は1始まりにしている
    options.sheet = index - 1;
  }

  const headerRow = form.headerRow.trim();
  if (headerRow) {
    const row = parsePositiveInt(headerRow);
    if (row === null) return { ok: false, error: "ヘッダー行は1以上の整数で指定してください。" };
    options.headerRow = row;
  }

  return { ok: true, options };
}

/**
 * 1以上の整数の文字列を数値にする
 *
 * @param text - 前後の空白を除いた入力
 * @returns 数値、または1以上の整数でなければ null
 */
function parsePositiveInt(text: string): number | null {
  return /^[1-9]\d*$/.test(text) ? Number(text) : null;
}
