import terser from "@rollup/plugin-terser";
import strip from "@rollup/plugin-strip";

export default {
  input: "src/main.js",
  output: [
    {
      file: "prism-autoloader-plus.js",
      format: "iife",
    },
    {
      file: "prism-autoloader-plus.min.js",
      format: "iife",
      plugins: [terser()],
    },
  ],
  plugins: [
    strip({
      labels: ["unittest"],
    }),
  ],
};
