import { type ReactElement, useMemo } from "react";
import type { RowError } from "web-xlsx";
import { Button } from "../../components/Button";
import { CopyButton } from "../../components/CopyButton";
import { ErrorNotice } from "../../components/ErrorNotice";
import { Table } from "../../components/Table";
import { download, replaceExtension } from "../../lib/download";
import { rowErrorMessage } from "../../lib/rowError";
import type { ReadResult } from "../../lib/xlsx";

type Props = {
  result: ReadResult | null;
  loading: boolean;
  fileName: string;
  pretty: boolean;
  onPrettyChange: (pretty: boolean) => void;
};

/**
 * xlsx の読み込み結果を JSON・表・検証エラーで表示する
 *
 * @param props - 読み込み結果・変換中かどうか・元のファイル名・整形の設定
 * @returns 結果の表示
 */
export function ReadResultPanel({ result, loading, fileName, pretty, onPrettyChange }: Props): ReactElement {
  const json = useMemo(
    () => (result?.ok ? JSON.stringify(result.rows, null, pretty ? 2 : undefined) : ""),
    [result, pretty],
  );

  if (!result) {
    return (
      <p className="text-sm text-slate-400">{loading ? "変換中…" : "xlsx ファイルを選ぶとここに JSON が出ます。"}</p>
    );
  }
  if (!result.ok) return <ErrorNotice messages={[result.error]} />;

  return (
    <div className={`flex flex-col gap-3 transition-opacity ${loading ? "opacity-50" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-700">JSON 出力（{result.rows.length} 行）</h3>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs text-slate-600">
            <input type="checkbox" checked={pretty} onChange={(e) => onPrettyChange(e.target.checked)} />
            整形
          </label>
          <CopyButton text={json} />
          <Button
            variant="primary"
            onClick={() => download(json, replaceExtension(fileName, ".json"), "application/json")}
          >
            .json をDL
          </Button>
        </div>
      </div>
      <RowErrorList errors={result.errors} />
      <Table rows={result.rows} />
      <pre className="max-h-80 overflow-auto rounded bg-slate-900 p-3 text-xs text-slate-100">{json}</pre>
    </div>
  );
}

/**
 * 行単位の検証エラーを折りたたんで表示する
 *
 * @param props - 行単位のエラー
 * @returns エラーの一覧（無ければ何も描画しない）
 */
function RowErrorList({ errors }: { errors: RowError[] }): ReactElement | null {
  if (errors.length === 0) return null;
  return (
    <details className="rounded bg-amber-50 px-3 py-2 text-sm text-amber-700">
      <summary className="cursor-pointer font-medium">
        検証エラー {errors.length} 件（エラーのある行は出力から除外）
      </summary>
      <ul className="mt-2 space-y-1 text-xs">
        {errors.map((e, i) => (
          <li key={i}>{rowErrorMessage(e)}</li>
        ))}
      </ul>
    </details>
  );
}
