/* eslint-disable import/no-extraneous-dependencies */
import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import replace from "rollup-plugin-replace";
import { terser } from "rollup-plugin-terser";
import sourcemaps from "rollup-plugin-sourcemaps";
import builtins from "rollup-plugin-node-builtins";
import globals from "rollup-plugin-node-globals";
import json from "rollup-plugin-json";
import gzipPlugin from "rollup-plugin-gzip";
import brotli from "rollup-plugin-brotli";
import visualizer from "rollup-plugin-visualizer";
import * as webPackage from "./package.json";

const distFileName = `dist/integrations/${process.env.INTG_NAME}.js`;
const { version } = webPackage;
const moduleType = "web";

const outputFiles = [];
outputFiles.push({
  file: distFileName,
  format: "iife",
  name: `${process.env.INTG_NAME}`,
  sourcemap:
    process.env.PROD_DEBUG_INLINE === "true"
      ? "inline"
      : !!process.env.PROD_DEBUG,
});

export default {
  input: `./integrations/${process.env.INTG_NAME}/index.js`,
  external: ["Xmlhttprequest", "universal-analytics"],
  output: outputFiles,
  plugins: [
    sourcemaps(),
    replace({
      "process.browser": process.env.NODE_ENV !== "true",
      "process.prod": process.env.ENV === "prod",
      "process.package_version": version,
      "process.module_type": moduleType,
    }),
    resolve({
      jsnext: true,
      browser: true,
      preferBuiltins: false,
    }),

    commonjs({
      include: "node_modules/**",
      /* namedExports: {
      // left-hand side can be an absolute path, a path
      // relative to the current directory, or the name
      // of a module in node_modules
      Xmlhttprequest: ["Xmlhttprequest"]
    } */
    }),

    json(),
    globals(),
    builtins(),

    babel({
      exclude: ["node_modules/@babel/**", "node_modules/core-js/**"],
      presets: [["@babel/env"]],
      plugins: [
        [
          "@babel/plugin-proposal-class-properties",
          {
            loose: true,
          },
        ],
        ["@babel/plugin-transform-arrow-functions"],
        ["@babel/plugin-transform-object-assign"],
      ],
    }),
    process.env.uglify === "true" && terser(),
    process.env.ENC === "gzip" && gzipPlugin(),
    process.env.ENC === "br" && brotli(),
    process.env.visualizer === "true" &&
      process.env.uglify === "true" &&
      visualizer({ sourcemap: true }),
  ],
};
