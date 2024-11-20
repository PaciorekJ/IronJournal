import { build } from "esbuild";

await build({
    entryPoints: ["translationWorker.ts"],
    bundle: true,
    platform: "node",
    target: "node20",
    outfile: "build/index.js",
    sourcemap: false,
    minify: true,
    external: [],
});
