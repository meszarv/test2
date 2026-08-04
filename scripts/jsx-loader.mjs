import { readFile } from "node:fs/promises";
import { transform } from "esbuild";

export async function load(url, context, nextLoad) {
  if (url.endsWith(".jsx")) {
    const source = await readFile(new URL(url), "utf8");
    const transformed = await transform(source, {
      loader: "jsx",
      format: "esm",
      jsx: "automatic",
      sourcemap: "inline",
    });
    return { format: "module", source: transformed.code, shortCircuit: true };
  }
  return nextLoad(url, context);
}
