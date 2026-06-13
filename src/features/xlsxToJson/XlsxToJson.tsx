import { useState } from "react";
import { type ParseOptions, parseFile, type RowError, type Schema } from "web-xlsx";
import { Dropzone } from "../../components/Dropzone";
import { Table } from "../../components/Table";
import { download } from "../../lib/download";
import { fileErrorMessage } from "../../lib/fileError";
import { parseSchemaText, SAMPLE_SCHEMA } from "../../lib/schemaText";

type Output = { rows: Record<string, unknown>[]; json: string; errors: RowError[] };

export function XlsxToJson() {
  const [fileName, setFileName] = useState("");
  const [sheet, setSheet] = useState("");
  const [headerRow, setHeaderRow] = useState("");
  const [pretty, setPretty] = useState(true);
  const [useSchema, setUseSchema] = useState(false);
  const [schemaText, setSchemaText] = useState(SAMPLE_SCHEMA);
  const [out, setOut] = useState<Output | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setBusy(true);
    setError("");
    setOut(null);
    setFileName(file.name);

    const options: ParseOptions = { utc: true };
    if (sheet.trim()) {
      const n = Number(sheet.trim());
      options.sheet = Number.isInteger(n) ? n : sheet.trim();
    }
    if (headerRow.trim()) options.headerRow = Number(headerRow.trim());

    try {
      let schema: Schema | undefined;
      if (useSchema) {
        const parsed = parseSchemaText(schemaText);
        if (!parsed.ok) {
          setError(parsed.error);
          return;
        }
        schema = parsed.schema;
      }

      const result = schema ? await parseFile(file, { schema, options }) : await parseFile(file, { options });

      if (!result.ok) {
        setError(fileErrorMessage(result.error.code));
        return;
      }

      const rows = result.data as Record<string, unknown>[];
      setOut({ rows, json: JSON.stringify(rows, null, pretty ? 2 : 0), errors: result.errors });
    } catch (e) {
      setError(`予期しないエラー: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm text-slate-600">
            シート（名前か番号・任意）
            <input
              value={sheet}
              onChange={(e) => setSheet(e.target.value)}
              placeholder="例: 1 / Sheet1"
              className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
            />
          </label>
          <label className="text-sm text-slate-600">
            ヘッダー行（任意）
            <input
              value={headerRow}
              onChange={(e) => setHeaderRow(e.target.value)}
              placeholder="例: 1"
              className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
            />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={pretty} onChange={(e) => setPretty(e.target.checked)} />
          JSON を整形する
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={useSchema} onChange={(e) => setUseSchema(e.target.checked)} />
          スキーマで型付き取込（任意）
        </label>
        {useSchema && (
          <textarea
            value={schemaText}
            onChange={(e) => setSchemaText(e.target.value)}
            spellCheck={false}
            className="h-44 w-full rounded border border-slate-300 p-2 font-mono text-xs"
          />
        )}

        <Dropzone accept=".xlsx" label="xlsx ファイル" onFile={handleFile} />
        {fileName && <p className="text-xs text-slate-400">{fileName}</p>}
        {busy && <p className="text-sm text-slate-500">変換中…</p>}
        {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      </section>

      <section className="flex flex-col gap-3">
        {out && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">JSON 出力</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(out.json)}
                  className="rounded bg-slate-200 px-3 py-1 text-xs font-medium hover:bg-slate-300"
                >
                  コピー
                </button>
                <button
                  type="button"
                  onClick={() => download(out.json, `${stripExt(fileName)}.json`, "application/json")}
                  className="rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700"
                >
                  .json をDL
                </button>
              </div>
            </div>

            {out.errors.length > 0 && (
              <details className="rounded bg-amber-50 px-3 py-2 text-sm text-amber-700">
                <summary className="cursor-pointer font-medium">
                  検証エラー {out.errors.length} 件（正常行のみ出力）
                </summary>
                <ul className="mt-2 space-y-1 text-xs">
                  {out.errors.map((e, i) => (
                    <li key={i}>
                      {e.row} 行目{e.column ? `・${e.column}` : ""}: {e.message}
                    </li>
                  ))}
                </ul>
              </details>
            )}

            <Table rows={out.rows} />
            <pre className="max-h-80 overflow-auto rounded bg-slate-900 p-3 text-xs text-slate-100">{out.json}</pre>
          </>
        )}
      </section>
    </div>
  );
}

function stripExt(name: string): string {
  return name.replace(/\.[^.]+$/, "") || "data";
}
