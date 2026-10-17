const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?$/;

/**
 * JSON の日付文字列を Date にする
 *
 * @param text - YYYY-MM-DD、またはそれに時刻とタイムゾーンを付けた文字列
 * @returns 日付、または日付として読めなければ null
 */
export function parseIsoDate(text: string): Date | null {
  const match = ISO_DATE_RE.exec(text);
  if (!match) return null;
  const [, time, , , zone] = match;

  // タイムゾーン無しの日時は Date だとローカル時刻になるので、読み書きの utc: true に揃えて UTC とみなす
  const date = new Date(time && !zone ? `${text}Z` : text);
  if (Number.isNaN(date.getTime())) return null;

  // Date は 2024-02-30 を 3/1 に繰り上げて受理するので、UTC で読む場合は暦日が変わっていないか確かめる
  const utc = !zone || zone === "Z";
  if (utc && date.toISOString().slice(0, 10) !== text.slice(0, 10)) return null;
  return date;
}
