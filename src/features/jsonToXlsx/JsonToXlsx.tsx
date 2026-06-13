import { useState } from "react";
import type { Row } from "web-xlsx";
import { build } from "web-xlsx/write";
import { Table } from "../../components/Table";
import { download, XLSX_MIME } from "../../lib/download";

const SAMPLE_JSON = `[
  { "name": "山田太郎", "age": 30, "active": true },
  { "name": "佐藤花子", "age": 25, "active": false }
]`;

export function JsonToXlsx() {
  const [jsonText, setJsonText] = useState(SAMPLE_JSON);
  const [sheetName, setSheetName] = useState("Sheet1");
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function loadFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => setJsonText(String(reader.result ?? ""));
    reader.readAsText(file);
  }

  async function handleBuild() {
    setBusy(true);
    setError("");
    setRows([]);

    let data: unknown;
    try {
      data = JSON.parse(jsonText);
    } catch (e) {
      setError(`JSON として読めません: ${(e as Error).message}`);
      setBusy(false);
      return;
    }
    if (!Array.isArray(data)) {
      setError("オブジェクトの配列（例: [{...}, {...}]）で入力してください。");
      setBusy(false);
      return;
    }

    try {
      // build は成功時に xlsx のバイト列を返し、失敗時は例外を投げる
      const bytes = await build(data as Row[], { options: { sheetName: sheetName || "Sheet1", utc: true } });
      setRows(data as Record<string, unknown>[]);
      download(bytes, `${sheetName || "data"}.xlsx`, XLSX_MIME);
    } catch (e) {
      setError(`生成に失敗しました: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="flex flex-col gap-3">
        <label className="text-sm text-slate-600">
          シート名
          <input
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
          />
        </label>

        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          spellCheck={false}
          className="h-72 w-full rounded border border-slate-300 p-2 font-mono text-xs"
        />

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBuild}
            disabled={busy}
            className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {busy ? "生成中…" : ".xlsx を生成してDL"}
          </button>
          <label className="cursor-pointer text-xs text-slate-500 underline">
            .json を読み込む
            <input
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) loadFile(f);
                e.target.value = "";
              }}
            />
          </label>
        </div>

        {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      </section>

      <section className="flex flex-col gap-3">
        {rows.length > 0 && (
          <>
            <h3 className="text-sm font-semibold text-slate-700">プレビュー（キー = ヘッダー）</h3>
            <Table rows={rows} />
          </>
        )}
      </section>
    </div>
  );
}
