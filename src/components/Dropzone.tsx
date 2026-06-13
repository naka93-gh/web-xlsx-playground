import { useRef, useState } from "react";

type Props = {
  accept: string;
  label: string;
  onFile: (file: File) => void;
};

// ドラッグ&ドロップ or クリックでファイルを 1 つ受け取る
export function Dropzone({ accept, label, onFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
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
      className={`flex w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-4 py-10 text-center transition ${
        over ? "border-indigo-500 bg-indigo-50" : "border-slate-300 bg-slate-50 hover:border-slate-400"
      }`}
    >
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span className="text-xs text-slate-400">ドロップ、またはクリックして選択</span>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
    </button>
  );
}
