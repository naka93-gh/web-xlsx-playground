import { useMemo, useState } from "react";
import type { Schema } from "web-xlsx";
import { SAMPLE_SCHEMA_TEXT } from "../../lib/sample";
import { parseSchemaText } from "../../lib/schemaText";

export type SchemaInput = {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  text: string;
  setText: (text: string) => void;
  /** 無効なら undefined */
  schema: Schema | undefined;
  /** 有効かつ書式が不正なときだけ入る */
  error: string | null;
};

/**
 * 両タブで共有するスキーマの入力状態を持つ
 *
 * @returns 入力状態と、それを読んだスキーマ
 */
export function useSchemaInput(): SchemaInput {
  const [enabled, setEnabled] = useState(false);
  const [text, setText] = useState(SAMPLE_SCHEMA_TEXT);
  const parsed = useMemo(() => (enabled ? parseSchemaText(text) : null), [enabled, text]);

  return {
    enabled,
    setEnabled,
    text,
    setText,
    schema: parsed?.ok ? parsed.schema : undefined,
    error: parsed && !parsed.ok ? parsed.error : null,
  };
}
