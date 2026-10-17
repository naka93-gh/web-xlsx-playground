import type { ReactElement } from "react";
import { TextField } from "../../components/TextField";
import type { ParseForm } from "../../lib/parseForm";

/**
 * シートとヘッダー行の指定欄
 *
 * @param props - フォームの値と変更時のコールバック
 * @returns 入力欄
 */
export function ParseOptionsForm({
  form,
  onChange,
}: {
  form: ParseForm;
  onChange: (form: ParseForm) => void;
}): ReactElement {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex items-end gap-2">
        <label className="text-sm text-slate-600">
          シート
          <select
            value={form.sheetBy}
            onChange={(e) => onChange({ ...form, sheetBy: e.target.value as ParseForm["sheetBy"] })}
            className="mt-1 block rounded border border-slate-300 px-1 py-1"
          >
            <option value="index">番号</option>
            <option value="name">名前</option>
          </select>
        </label>
        <div className="flex-1">
          <TextField
            label={form.sheetBy === "index" ? "（1始まり・任意）" : "（任意）"}
            value={form.sheet}
            onChange={(sheet) => onChange({ ...form, sheet })}
            placeholder={form.sheetBy === "index" ? "例: 1" : "例: Sheet1"}
          />
        </div>
      </div>
      <TextField
        label="ヘッダー行（任意）"
        value={form.headerRow}
        onChange={(headerRow) => onChange({ ...form, headerRow })}
        placeholder="例: 1"
      />
    </div>
  );
}
