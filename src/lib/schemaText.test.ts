import { describe, expect, it } from "vitest";
import { SAMPLE_SCHEMA_TEXT } from "./sample";
import { parseSchemaText } from "./schemaText";

/**
 * エラーになるはずの入力を読ませ、そのメッセージを取り出す
 *
 * @param text - スキーマのテキスト
 * @returns エラーメッセージ
 */
function errorOf(text: string): string {
  const result = parseSchemaText(text);
  if (result.ok) throw new Error("エラーになるはずの入力が通った");
  return result.error;
}

describe("parseSchemaText", () => {
  it("サンプルのスキーマのとき列定義を返す", () => {
    expect(parseSchemaText(SAMPLE_SCHEMA_TEXT)).toEqual({
      ok: true,
      schema: {
        名前: { prop: "name", type: "string", required: true },
        年齢: { prop: "age", type: "number", required: undefined },
        入社日: { prop: "hireDate", type: "date", required: undefined },
      },
    });
  });

  it("date 列に defaultValue があるとき Date にして返す", () => {
    const result = parseSchemaText('{ "日": { "prop": "d", "type": "date", "defaultValue": "2024-04-01" } }');
    expect(result.ok && result.schema.日?.defaultValue).toEqual(new Date(Date.UTC(2024, 3, 1)));
  });

  it("ヘッダーが __proto__ のときも列として返す", () => {
    const result = parseSchemaText('{ "__proto__": { "prop": "p", "type": "string" } }');
    expect(result.ok && Object.keys(result.schema)).toEqual(["__proto__"]);
  });

  it.each([
    ["入力が空", "  ", "スキーマが空です"],
    ["JSON として不正", "{", "JSONとして読めません"],
    ["配列", "[]", "オブジェクト"],
    ["列定義がオブジェクト以外", '{ "a": 1 }', "a: 列定義はオブジェクト"],
    ["prop 欠落", '{ "a": { "type": "string" } }', "a: prop"],
    ["type が未対応", '{ "a": { "prop": "a", "type": "int" } }', "a: type は"],
    ["required が真偽値以外", '{ "a": { "prop": "a", "type": "string", "required": "yes" } }', "a: required"],
    ["未対応のキーあり", '{ "a": { "prop": "a", "type": "string", "validate": "x" } }', "未対応のキー「validate」"],
    ["defaultValue と type が不統一", '{ "a": { "prop": "a", "type": "number", "defaultValue": "1" } }', "数値にして"],
    ["date の defaultValue が日付以外", '{ "a": { "prop": "a", "type": "date", "defaultValue": "x" } }', "日付文字列"],
    [
      "prop が重複",
      '{ "a": { "prop": "x", "type": "string" }, "b": { "prop": "x", "type": "string" } }',
      "b: prop「x」",
    ],
  ])("%sのときエラーを返す", (_, text, message) => {
    expect(errorOf(text)).toContain(message);
  });
});
