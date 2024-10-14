import path from "node:path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const cwd = process.cwd();
export type DefineConfig = {
  siteName?: string;
  server?: {
    port?: number;
    open?: boolean;
  };
};
type Config = {
  default: DefineConfig;
};
async function loadConfig() {
  const configPath = [
    path.join(cwd, "swan.config.ts"),
    path.join(cwd, "swan.config.js"),
    path.join(cwd, "swan.config.mjs"),
    path.join(cwd, "swan.config.cjs"),
  ];
  for (const path of configPath) {
    try {
      return await import(path);
    } catch {}
  }
  return {};
}

const config: Config = await loadConfig();
//
export const siteName = config.default.siteName ?? "SWAN";
export const serverPort = config.default.server?.port ?? 3000;
export const staticDir = path.join(cwd, "app");
export const _open = config.default.server?.open ?? false;
