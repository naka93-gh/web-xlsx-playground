import { describe, expect, it } from "vitest";
import { INITIAL_PARSE_FORM, toParseOptions } from "./parseForm";

describe("toParseOptions", () => {
  it("入力なしのとき空のオプションを返す", () => {
    expect(toParseOptions(INITIAL_PARSE_FORM)).toEqual({ ok: true, options: {} });
  });

  it("シート番号指定のとき0始まりに直した番号を返す", () => {
    expect(toParseOptions({ ...INITIAL_PARSE_FORM, sheet: "1" })).toEqual({ ok: true, options: { sheet: 0 } });
  });

  it("名前指定のとき数字だけのシート名も前後の空白を除いた名前で返す", () => {
    expect(toParseOptions({ sheetBy: "name", sheet: " 2024 ", headerRow: "" })).toEqual({
      ok: true,
      options: { sheet: "2024" },
    });
  });

  it("ヘッダー行指定のとき数値にした行番号を返す", () => {
    expect(toParseOptions({ ...INITIAL_PARSE_FORM, headerRow: "3" })).toEqual({ ok: true, options: { headerRow: 3 } });
  });

  it.each(["0", "-1", "1.5", "abc"])("シート番号が %s のときエラーを返す", (sheet) => {
    expect(toParseOptions({ ...INITIAL_PARSE_FORM, sheet }).ok).toBe(false);
  });

  it.each(["0", "abc"])("ヘッダー行が %s のときエラーを返す", (headerRow) => {
    expect(toParseOptions({ ...INITIAL_PARSE_FORM, headerRow }).ok).toBe(false);
  });
});
