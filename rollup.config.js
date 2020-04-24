const babel = require("rollup-plugin-babel");
const commonjs = require("rollup-plugin-commonjs");
const resolve = require("rollup-plugin-node-resolve");

module.exports = {
  input: "src/main.js",
  output: {
    file: "dist/src/content.js",
    format: "iife", // immediately-invoked function expression — suitable for <script> tags
  },
  plugins: [
    resolve(),
    babel({
      exclude: "node_modules/**",
    }),
    commonjs(),
  ],
};
