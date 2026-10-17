import { type ReactElement, type ReactNode, useState } from "react";
import { JsonToXlsx } from "./features/jsonToXlsx/JsonToXlsx";
import { useSchemaInput } from "./features/schema/useSchemaInput";
import { XlsxToJson } from "./features/xlsxToJson/XlsxToJson";

type Tab = "x2j" | "j2x";

/**
 * アプリ全体のレイアウトとタブ切り替え
 *
 * @returns アプリ
 */
export function App(): ReactElement {
  const [tab, setTab] = useState<Tab>("x2j");
  const schemaInput = useSchemaInput();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">web-xlsx playground</h1>
        <p className="mt-1 text-sm text-slate-500">
          ブラウザだけで動く xlsx ⇄ JSON 変換。ファイルはサーバーに送られません。
        </p>
      </header>

      <div role="tablist" className="mb-6 flex gap-2 border-b border-slate-200">
        <TabButton active={tab === "x2j"} onClick={() => setTab("x2j")}>
          xlsx → JSON
        </TabButton>
        <TabButton active={tab === "j2x"} onClick={() => setTab("j2x")}>
          JSON → xlsx
        </TabButton>
      </div>

      {/* タブを切り替えても入力が消えないよう、両方マウントしたまま隠す */}
      <div hidden={tab !== "x2j"}>
        <XlsxToJson schemaInput={schemaInput} />
      </div>
      <div hidden={tab !== "j2x"}>
        <JsonToXlsx schemaInput={schemaInput} />
      </div>

      <footer className="mt-10 text-xs text-slate-400">
        powered by{" "}
        <a href="https://www.npmjs.com/package/web-xlsx" className="underline">
          web-xlsx
        </a>{" "}
        v{__WEBXLSX_VERSION__}
      </footer>
    </div>
  );
}

/**
 * タブの見出しボタン
 *
 * @param props - 選択中かどうか・クリック時のコールバック・ラベル
 * @returns ボタン
 */
function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}): ReactElement {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
        active ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}
