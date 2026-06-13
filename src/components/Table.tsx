// 任意のオブジェクト配列を表でプレビューする（最大 max 行）
export function Table({ rows, max = 50 }: { rows: Record<string, unknown>[]; max?: number }) {
  if (rows.length === 0) {
    return <p className="text-sm text-slate-400">データがありません。</p>;
  }

  const cols = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const shown = rows.slice(0, max);

  return (
    <div className="overflow-auto rounded border border-slate-200">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-slate-100">
          <tr>
            {cols.map((c) => (
              <th key={c} className="whitespace-nowrap px-3 py-2 text-left font-semibold text-slate-700">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shown.map((row, i) => (
            <tr key={i} className="odd:bg-white even:bg-slate-50">
              {cols.map((c) => (
                <td key={c} className="whitespace-nowrap px-3 py-1.5 text-slate-600">
                  {formatCell(row[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > max && (
        <p className="px-3 py-2 text-xs text-slate-400">
          先頭 {max} 行のみ表示（全 {rows.length} 行）
        </p>
      )}
    </div>
  );
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
