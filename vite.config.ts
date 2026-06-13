import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// 実際にインストールされている web-xlsx のバージョンを読み、UI 表示用に inject する。
// web-xlsx は ESM 専用で exports が package.json を公開しないため、node_modules から直接読む
const root = dirname(fileURLToPath(import.meta.url));
const pkgPath = join(root, "node_modules", "web-xlsx", "package.json");
const webXlsxVersion: string = JSON.parse(readFileSync(pkgPath, "utf8")).version;

// GitHub Pages 配信用の base。リポジトリ名に合わせる（独自ドメイン/ルート配信なら "/"）
export default defineConfig({
  base: "/web-xlsx-playground/",
  plugins: [react()],
  define: {
    __WEBXLSX_VERSION__: JSON.stringify(webXlsxVersion),
  },
});
