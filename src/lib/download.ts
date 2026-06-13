// Blob を生成してダウンロードさせる
export function download(data: string | Uint8Array, filename: string, type: string): void {
  // Uint8Array は素の ArrayBuffer にコピーして BlobPart 互換にする
  const part: BlobPart = typeof data === "string" ? data : copyToArrayBuffer(data);
  const blob = new Blob([part], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function copyToArrayBuffer(data: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(data.byteLength);
  copy.set(data);
  return copy.buffer;
}

export const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
