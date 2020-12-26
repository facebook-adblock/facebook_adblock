import babel from "@rollup/plugin-babel";
import cleanup from "rollup-plugin-cleanup";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";

const config = {
  input: "src/main.js",
  output: {
    file: "dist/src/content.js",
    format: "iife", // immediately-invoked function expression — suitable for <script> tags
  },
  plugins: [
    nodeResolve(),
    babel({
      babelHelpers: "bundled",
      exclude: "node_modules/**",
    }),
    commonjs(),
    cleanup(),
  ],
};

export default config;
