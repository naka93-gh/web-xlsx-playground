import { type ReactElement, useMemo, useState } from "react";
import { Button } from "../../components/Button";
import { ErrorNotice } from "../../components/ErrorNotice";
import { Table } from "../../components/Table";
import { TextField } from "../../components/TextField";
import { download, XLSX_MIME } from "../../lib/download";
import { errorMessage } from "../../lib/errorMessage";
import { parseJsonRows, toSheetRows } from "../../lib/jsonRows";
import { SAMPLE_JSON } from "../../lib/sample";
import { DEFAULT_SHEET_NAME, writeXlsx } from "../../lib/xlsx";
import { SchemaEditor } from "../schema/SchemaEditor";
import type { SchemaInput } from "../schema/useSchemaInput";

/**
 * JSON → xlsx タブ
 *
 * @param props - 両タブで共有するスキーマの入力状態
 * @returns タブの中身
 */
export function JsonToXlsx({ schemaInput }: { schemaInput: SchemaInput }): ReactElement {
  const [jsonText, setJsonText] = useState(SAMPLE_JSON);
  const [sheetName, setSheetName] = useState("");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);

  const { schema, error: schemaError } = schemaInput;
  const parsed = useMemo(() => (schemaError ? null : parseJsonRows(jsonText, schema)), [jsonText, schema, schemaError]);
  const sheetRows = useMemo(() => (parsed?.ok ? toSheetRows(parsed.rows, schema) : []), [parsed, schema]);

  /**
   * 入力中の行を xlsx にしてダウンロードさせる
   */
  async function handleDownload(): Promise<void> {
    if (!parsed?.ok) return;
    setBusy(true);
    setActionError("");
    const name = sheetName.trim() || DEFAULT_SHEET_NAME;
    try {
      const result = await writeXlsx(parsed.rows, name, schema);
      if (result.ok) download(result.data, `${name}.xlsx`, XLSX_MIME);
      else setActionError(result.error);
    } catch (e) {
      setActionError(`生成に失敗しました: ${errorMessage(e)}`);
    } finally {
      setBusy(false);
    }
  }

  /**
   * JSON ファイルの中身を入力欄に読み込む
   *
   * @param file - 選ばれた JSON ファイル
   */
  async function loadJsonFile(file: File): Promise<void> {
    try {
      setJsonText(await file.text());
      setActionError("");
    } catch (e) {
      setActionError(`ファイルを読めません: ${errorMessage(e)}`);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">JSON（オブジェクトの配列）</span>
          <JsonFileButton onFile={loadJsonFile} />
        </div>
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          spellCheck={false}
          aria-label="JSON"
          className="h-72 w-full rounded border border-slate-300 p-2 font-mono text-xs"
        />
        <ErrorNotice messages={parsed && !parsed.ok ? parsed.errors : []} />
        <SchemaEditor input={schemaInput} />
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <TextField label="シート名" value={sheetName} onChange={setSheetName} placeholder={DEFAULT_SHEET_NAME} />
          </div>
          <Button variant="primary" onClick={handleDownload} disabled={busy || !parsed?.ok}>
            {busy ? "生成中…" : ".xlsx をDL"}
          </Button>
        </div>
        <ErrorNotice messages={actionError ? [actionError] : []} />
        <h3 className="text-sm font-semibold text-slate-700">プレビュー（{sheetRows.length} 行）</h3>
        <Table rows={sheetRows} />
      </section>
    </div>
  );
}

/**
 * JSON ファイルを選ぶリンク風のボタン
 *
 * @param props - ファイルを受け取るコールバック
 * @returns ボタン
 */
function JsonFileButton({ onFile }: { onFile: (file: File) => void }): ReactElement {
  return (
    <label className="cursor-pointer text-xs text-slate-500 underline focus-within:ring-2 focus-within:ring-indigo-500">
      .json を読み込む
      <input
        type="file"
        accept=".json,application/json"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
    </label>
  );
}
