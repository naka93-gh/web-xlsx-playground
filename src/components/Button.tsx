import type { ButtonHTMLAttributes, ReactElement } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" };

const VARIANTS = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-700",
  secondary: "bg-slate-200 text-slate-700 hover:bg-slate-300",
};

/**
 * 見た目を揃えたボタン
 *
 * @param props - variant と button 要素の属性
 * @returns ボタン
 */
export function Button({ variant = "secondary", className = "", ...props }: Props): ReactElement {
  return (
    <button
      type="button"
      className={`rounded-sm px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
