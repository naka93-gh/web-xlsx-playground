import { describe, expect, it } from "vitest";
import type { Schema } from "web-xlsx";
import { copyToArrayBuffer } from "./download";
import { parseJsonRows } from "./jsonRows";
import { createSampleXlsx, SAMPLE_JSON, SAMPLE_SCHEMA_TEXT } from "./sample";
import { parseSchemaText } from "./schemaText";
import { readXlsx, writeXlsx } from "./xlsx";

/**
 * サンプルのスキーマを読む
 *
 * @returns サンプルのスキーマ
 */
function sampleSchema(): Schema {
  const parsed = parseSchemaText(SAMPLE_SCHEMA_TEXT);
  if (!parsed.ok) throw new Error(parsed.error);
  return parsed.schema;
}

describe("readXlsx", () => {
  it("サンプルをサンプルスキーマで読むとき正常な2行と残り2行の検証エラーを返す", async () => {
    const result = await readXlsx(await createSampleXlsx(), {}, sampleSchema());
    expect(result).toMatchObject({
      ok: true,
      rows: [
        { name: "山田太郎", age: 30, hireDate: new Date(Date.UTC(2020, 3, 1)) },
        { name: "佐藤花子", age: 25, hireDate: new Date(Date.UTC(2023, 9, 1)) },
      ],
      errors: [
        { code: "non-number", row: 4, column: "年齢" },
        { code: "required", row: 5, column: "名前" },
      ],
    });
  });

  it("シートが見つからないとき日本語のエラーを返す", async () => {
    expect(await readXlsx(await createSampleXlsx(), { sheet: 1 })).toEqual({
      ok: false,
      error: "指定したシートが見つかりません。",
    });
  });
});

describe("writeXlsx", () => {
  it("スキーマ付きで書いた xlsx を同じスキーマで読むとき元の行を返す", async () => {
    const schema = sampleSchema();
    const parsed = parseJsonRows(SAMPLE_JSON, schema);
    if (!parsed.ok) throw new Error(parsed.errors.join("\n"));

    const written = await writeXlsx(parsed.rows, "社員", schema);
    if (!written.ok) throw new Error(written.error);
    const read = await readXlsx(new Blob([copyToArrayBuffer(written.data)]), { sheet: "社員" }, schema);

    expect(read).toEqual({ ok: true, rows: parsed.rows, errors: [] });
  });
});
