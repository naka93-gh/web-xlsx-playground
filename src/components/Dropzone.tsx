import { type ReactElement, useState } from "react";

type Props = {
  accept: string;
  label: string;
  onFile: (file: File) => void;
};

/**
 * ドラッグ&ドロップかクリックでファイルを 1 つ受け取る
 *
 * @param props - 受け付ける拡張子・表示ラベル・ファイルを受け取るコールバック
 * @returns ドロップ領域
 */
export function Dropzone({ accept, label, onFile }: Props): ReactElement {
  const [over, setOver] = useState(false);

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const file = e.dataTransfer.files[0];
        if (file) onFile(file);
      }}
      className={`flex w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-4 py-10 text-center transition focus-within:ring-2 focus-within:ring-indigo-500 ${
        over ? "border-indigo-500 bg-indigo-50" : "border-slate-300 bg-slate-50 hover:border-slate-400"
      }`}
    >
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span className="text-xs text-slate-400">ドロップ、またはクリックして選択</span>
      {/* hidden だとキーボードでフォーカスできないので sr-only で隠す */}
      <input
        type="file"
        accept={accept}
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
