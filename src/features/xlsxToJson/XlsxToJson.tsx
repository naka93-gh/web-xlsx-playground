import { type ReactElement, useMemo, useState } from "react";
import { Button } from "../../components/Button";
import { Dropzone } from "../../components/Dropzone";
import { ErrorNotice } from "../../components/ErrorNotice";
import { INITIAL_PARSE_FORM, toParseOptions } from "../../lib/parseForm";
import { createSampleXlsx } from "../../lib/sample";
import { SchemaEditor } from "../schema/SchemaEditor";
import type { SchemaInput } from "../schema/useSchemaInput";
import { ParseOptionsForm } from "./ParseOptionsForm";
import { ReadResultPanel } from "./ReadResultPanel";
import { type ReadRequest, useXlsxRead } from "./useXlsxRead";

/**
 * xlsx → JSON タブ
 *
 * @param props - 両タブで共有するスキーマの入力状態
 * @returns タブの中身
 */
export function XlsxToJson({ schemaInput }: { schemaInput: SchemaInput }): ReactElement {
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState(INITIAL_PARSE_FORM);
  const [pretty, setPretty] = useState(true);

  const parsed = useMemo(() => toParseOptions(form), [form]);
  const { schema, error: schemaError } = schemaInput;
  const request = useMemo<ReadRequest | null>(
    () => (file && parsed.ok && !schemaError ? { file, options: parsed.options, schema } : null),
    [file, parsed, schema, schemaError],
  );
  const { result, loading } = useXlsxRead(request);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="flex flex-col gap-4">
        <Dropzone accept=".xlsx" label="xlsx ファイル" onFile={setFile} />
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs text-slate-400">{file?.name ?? "未選択"}</p>
          <Button onClick={() => createSampleXlsx().then(setFile)}>サンプルで試す</Button>
        </div>
        <ParseOptionsForm form={form} onChange={setForm} />
        <ErrorNotice messages={parsed.ok ? [] : [parsed.error]} />
        <SchemaEditor input={schemaInput} />
      </section>

      <section>
        <ReadResultPanel
          result={result}
          loading={loading}
          fileName={file?.name ?? ""}
          pretty={pretty}
          onPrettyChange={setPretty}
        />
      </section>
    </div>
  );
}
