/**
 * Blob を生成してダウンロードさせる
 *
 * @param data - ファイルの中身
 * @param filename - 保存するファイル名
 * @param type - MIME タイプ
 */
export function download(data: string | Uint8Array, filename: string, type: string): void {
  const part: BlobPart = typeof data === "string" ? data : copyToArrayBuffer(data);
  const url = URL.createObjectURL(new Blob([part], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  // click 直後に revoke するとダウンロード開始前に URL が無効になるブラウザがある
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/**
 * Uint8Array を素の ArrayBuffer にコピーする
 *
 * Uint8Array<ArrayBufferLike> のままでは BlobPart の型に合わない
 *
 * @param data - コピー元
 * @returns 同じ中身の ArrayBuffer
 */
export function copyToArrayBuffer(data: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(data.byteLength);
  copy.set(data);
  return copy.buffer;
}

/**
 * ファイル名の拡張子を差し替える
 *
 * @param filename - 元のファイル名
 * @param ext - ドット付きの新しい拡張子
 * @returns 差し替えたファイル名（元の名前が空なら data を使う）
 */
export function replaceExtension(filename: string, ext: string): string {
  return `${filename.replace(/\.[^.]+$/, "") || "data"}${ext}`;
}

export const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
