/**
 * catch した値から表示用のメッセージを取り出す
 *
 * @param e - catch した値
 * @returns Error ならその message、それ以外は文字列化した値
 */
export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}
