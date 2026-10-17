import type { ReactElement } from "react";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

/**
 * ラベル付きの 1 行テキスト入力
 *
 * @param props - ラベル・値・変更時のコールバック・プレースホルダ
 * @returns 入力欄
 */
export function TextField({ label, value, onChange, placeholder }: Props): ReactElement {
  return (
    <label className="text-sm text-slate-600">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
      />
    </label>
  );
}
