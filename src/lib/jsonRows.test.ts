import { describe, expect, it } from "vitest";
import type { Schema } from "web-xlsx";
import { parseJsonRows, toSheetRows } from "./jsonRows";

const schema: Schema = {
  名前: { prop: "name", type: "string", required: true },
  年齢: { prop: "age", type: "number" },
  在籍: { prop: "active", type: "boolean" },
  入社日: { prop: "hireDate", type: "date" },
};

describe("parseJsonRows", () => {
  it("スキーマなしで Cell になる値だけのときそのままの行を返す", () => {
    expect(parseJsonRows('[{ "a": "x", "b": 1, "c": true, "d": null }]')).toEqual({
      ok: true,
      rows: [{ a: "x", b: 1, c: true, d: null }],
    });
  });

  it("スキーマなしでネストした値があるときエラーを返す", () => {
    expect(parseJsonRows('[{ "a": { "b": 1 } }, { "c": [1] }]')).toEqual({
      ok: false,
      errors: [
        "1件目・a: 文字列・数値・真偽値・null のいずれかにしてください。",
        "2件目・c: 文字列・数値・真偽値・null のいずれかにしてください。",
      ],
    });
  });

  it("オブジェクト以外の要素があるときエラーを返す", () => {
    expect(parseJsonRows("[1]")).toEqual({ ok: false, errors: ["1件目: オブジェクトではありません。"] });
  });

  it("配列以外のときエラーを返す", () => {
    expect(parseJsonRows('{ "a": 1 }').ok).toBe(false);
  });

  it("JSON として不正なときエラーを返す", () => {
    expect(parseJsonRows("[").ok).toBe(false);
  });

  it("キーが __proto__ のときもそのキーを持つ行を返す", () => {
    const result = parseJsonRows('[{ "__proto__": "x" }]');
    expect(result.ok && Object.keys(result.rows[0] ?? {})).toEqual(["__proto__"]);
  });
  it("スキーマ付きのとき prop で値を引き date 列を Date にした行を返す", () => {
    const result = parseJsonRows('[{ "name": "山田", "age": 30, "active": true, "hireDate": "2020-04-01" }]', schema);
    expect(result).toEqual({
      ok: true,
      rows: [{ name: "山田", age: 30, active: true, hireDate: new Date(Date.UTC(2020, 3, 1)) }],
    });
  });

  it("スキーマ付きで任意列が欠落のとき null を入れた行を返す", () => {
    expect(parseJsonRows('[{ "name": "山田" }]', schema)).toEqual({
      ok: true,
      rows: [{ name: "山田", age: null, active: null, hireDate: null }],
    });
  });

  it("スキーマ付きで必須列の欠落や型の不統一があるとき列ごとのエラーを返す", () => {
    const result = parseJsonRows('[{ "age": "30", "active": 1, "hireDate": "昨日" }]', schema);
    expect(result).toEqual({
      ok: false,
      errors: [
        "1件目・name: 必須の値が空です。",
        "1件目・age: 数値ではありません。",
        "1件目・active: 真偽値ではありません。",
        "1件目・hireDate: 日付文字列（例: 2024-04-01）ではありません。",
      ],
    });
  });
});

describe("toSheetRows", () => {
  it("スキーマ付きのときヘッダー名をキーにしスキーマの列順に並べた行を返す", () => {
    expect(toSheetRows([{ age: 30, name: "山田" }], schema)).toEqual([
      { 名前: "山田", 年齢: 30, 在籍: null, 入社日: null },
    ]);
  });

  it("スキーマなしのとき渡した行をそのまま返す", () => {
    const rows = [{ a: 1 }];
    expect(toSheetRows(rows)).toBe(rows);
  });
});
