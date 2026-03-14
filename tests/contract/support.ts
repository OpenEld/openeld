import { expect } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const REPO_ROOT = new URL("../../", import.meta.url).pathname;

export function readJson<T>(...segments: string[]): T {
  const fullPath = join(REPO_ROOT, ...segments);
  return JSON.parse(readFileSync(fullPath, "utf8")) as T;
}

export function expectOfficialDocsMetadata(metadata: {
  sourceType: string;
  sourceUrl: string;
  provider: string;
}) {
  expect(metadata.sourceType).toBe("official-docs");
  expect(metadata.sourceUrl.startsWith("https://")).toBe(true);
  expect(metadata.provider.length > 0).toBe(true);
}
