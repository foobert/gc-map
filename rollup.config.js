import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";

module.exports = {
  input: "src/index.js",
  output: {
    file: "bundle.js",
    format: "iife"
  },
  plugins: [resolve({ browser: true }), commonjs()]
};
