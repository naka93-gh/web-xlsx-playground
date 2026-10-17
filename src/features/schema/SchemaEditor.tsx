import type { ReactElement } from "react";
import { ErrorNotice } from "../../components/ErrorNotice";
import type { SchemaInput } from "./useSchemaInput";

/**
 * スキーマの有効化と編集の欄
 *
 * @param props - 両タブで共有するスキーマの入力状態
 * @returns 入力欄
 */
export function SchemaEditor({ input }: { input: SchemaInput }): ReactElement {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" checked={input.enabled} onChange={(e) => input.setEnabled(e.target.checked)} />
        スキーマを使う（読み込み・書き出しで共通）
      </label>
      {input.enabled && (
        <>
          <textarea
            value={input.text}
            onChange={(e) => input.setText(e.target.value)}
            spellCheck={false}
            aria-label="スキーマ"
            className="h-44 w-full rounded-sm border border-slate-300 p-2 font-mono text-xs"
          />
          <p className="text-xs text-slate-400">
            ヘッダー名 → {"{ prop, type, required?, defaultValue? }"}。type は string / number / boolean / date
          </p>
          <ErrorNotice messages={input.error ? [input.error] : []} />
        </>
      )}
    </div>
  );
}
