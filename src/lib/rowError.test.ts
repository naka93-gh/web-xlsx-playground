import { describe, expect, it } from "vitest";
import { rowErrorMessage } from "./rowError";

describe("rowErrorMessage", () => {
  it("値付きのエラーのとき位置・日本語のメッセージ・値を返す", () => {
    expect(
      rowErrorMessage({ code: "non-number", row: 3, column: "年齢", value: "不明", message: "Not a number" }),
    ).toBe("3行目・年齢: 数値ではありません（値: 不明）");
  });

  it("値なしのとき値を含まないメッセージを返す", () => {
    expect(rowErrorMessage({ code: "required", row: 2, column: "名前", message: "Required" })).toBe(
      "2行目・名前: 必須の値が空です",
    );
  });

  it("validate のエラーのときスキーマ側のメッセージをそのまま返す", () => {
    expect(rowErrorMessage({ code: "validate", row: 2, message: "範囲外" })).toBe("2行目: 範囲外");
  });
});
