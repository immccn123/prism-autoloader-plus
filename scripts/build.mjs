import * as esbuild from "esbuild";

const buildTasks = [
  esbuild.build({
    entryPoints: ["src/main.js"],
    bundle: true,
    outfile: "prism-autoloader-plus.js",
    target: ["safari12", "chrome86"],
    format: "iife",
  }),
  esbuild.build({
    entryPoints: ["src/main.js"],
    bundle: true,
    outfile: "prism-autoloader-plus.min.js",
    minify: true,
    target: ["safari12", "chrome86"],
    format: "iife",
    legalComments: "linked",
  }),
];

await Promise.all(buildTasks);
