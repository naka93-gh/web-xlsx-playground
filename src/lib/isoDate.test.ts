import { describe, expect, it } from "vitest";
import { parseIsoDate } from "./isoDate";

describe("parseIsoDate", () => {
  it("日付だけの文字列のとき UTC 0:00 の Date を返す", () => {
    expect(parseIsoDate("2024-04-01")?.toISOString()).toBe("2024-04-01T00:00:00.000Z");
  });

  it("タイムゾーンなしの日時のとき UTC として読んだ Date を返す", () => {
    expect(parseIsoDate("2024-04-01T09:30")?.toISOString()).toBe("2024-04-01T09:30:00.000Z");
  });

  it("オフセット付きの日時のときそのオフセットで読んだ Date を返す", () => {
    expect(parseIsoDate("2024-04-01T09:00:00+09:00")?.toISOString()).toBe("2024-04-01T00:00:00.000Z");
  });

  it("JSON.stringify した Date のとき元と同じ時刻の Date を返す", () => {
    const date = new Date(Date.UTC(2024, 3, 1, 12, 34, 56, 789));
    expect(parseIsoDate(JSON.parse(JSON.stringify(date)))?.getTime()).toBe(date.getTime());
  });

  it.each(["2024-02-30", "2024-13-01", "2024/04/01", "1", "", "2024-04-01 09:00"])("%s のとき null を返す", (text) => {
    expect(parseIsoDate(text)).toBeNull();
  });
});
