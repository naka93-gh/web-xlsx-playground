import { useEffect, useState } from "react";
import type { ParseOptions, Schema } from "web-xlsx";
import { errorMessage } from "../../lib/errorMessage";
import { type ReadResult, readXlsx } from "../../lib/xlsx";

export type ReadRequest = { file: File; options: ParseOptions; schema: Schema | undefined };

/**
 * request が変わるたびに xlsx を読み直す
 *
 * 変換中も直前の結果を返し続け、表示が消えてちらつかないようにする
 *
 * @param request - 読む対象と設定（null なら読まない）
 * @returns 最新の結果と変換中かどうか
 */
export function useXlsxRead(request: ReadRequest | null): { result: ReadResult | null; loading: boolean } {
  const [result, setResult] = useState<ReadResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!request) {
      setResult(null);
      setLoading(false);
      return;
    }
    // 設定を続けて変えると前の変換が後から終わることがあるので、古い結果は捨てる
    let stale = false;
    setLoading(true);
    readXlsx(request.file, request.options, request.schema)
      .catch((e: unknown): ReadResult => ({ ok: false, error: `予期しないエラー: ${errorMessage(e)}` }))
      .then((r) => {
        if (stale) return;
        setResult(r);
        setLoading(false);
      });
    return () => {
      stale = true;
    };
  }, [request]);

  return { result, loading };
}
