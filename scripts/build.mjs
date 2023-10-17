import * as esbuild from "esbuild";

const buildTasks = [
  esbuild.build({
    entryPoints: ["src/main.js"],
    bundle: true,
    outfile: "prism-autoloader-plus.js",
    target: ["safari11", "chrome58", "firefox57"],
  }),
  esbuild.build({
    entryPoints: ["src/main.js"],
    bundle: true,
    outfile: "prism-autoloader-plus.min.js",
    minify: true,
    target: ["safari11", "chrome58", "firefox57"],
  }),
];

await Promise.all(buildTasks);
