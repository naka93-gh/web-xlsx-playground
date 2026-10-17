import type { Row } from "web-xlsx";
import { copyToArrayBuffer } from "./download";
import { DEFAULT_SHEET_NAME, writeXlsx } from "./xlsx";

export const SAMPLE_SCHEMA_TEXT = `{
  "名前": { "prop": "name", "type": "string", "required": true },
  "年齢": { "prop": "age", "type": "number" },
  "入社日": { "prop": "hireDate", "type": "date" }
}`;

export const SAMPLE_JSON = `[
  { "name": "山田太郎", "age": 30, "hireDate": "2020-04-01" },
  { "name": "佐藤花子", "age": 25, "hireDate": "2023-10-01" }
]`;

// 後ろ2行はサンプルスキーマの検証エラー表示を試せるように、わざと不正な値にしている
const SAMPLE_ROWS: Row[] = [
  { 名前: "山田太郎", 年齢: 30, 入社日: new Date(Date.UTC(2020, 3, 1)) },
  { 名前: "佐藤花子", 年齢: 25, 入社日: new Date(Date.UTC(2023, 9, 1)) },
  { 名前: "鈴木一郎", 年齢: "不明", 入社日: new Date(Date.UTC(2018, 6, 15)) },
  { 名前: null, 年齢: 41, 入社日: new Date(Date.UTC(2015, 0, 5)) },
];

/**
 * サンプルの xlsx をその場で生成する
 *
 * @returns sample.xlsx という名前のファイル
 */
export async function createSampleXlsx(): Promise<File> {
  const result = await writeXlsx(SAMPLE_ROWS, DEFAULT_SHEET_NAME);
  if (!result.ok) throw new Error(result.error);
  return new File([copyToArrayBuffer(result.data)], "sample.xlsx");
}
