import remote from "rollup-plugin-remote";
import babel from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import json from "@rollup/plugin-json";
const dropcompressplugin = terser({
    toplevel: true,
    output: { ecma: 5, comments: !1, ascii_only: !0 },
    compress: {
        toplevel: true,
        unused: true,
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log"],
    },
    mangle: { properties: false },
});
export default [
    {
        input: "./src/index.js",
        output: [{ file: "./dist/index.js", format: "iife", sourcemap: true }],
        plugins: [
            remote(),
            resolve(),
            commonjs(),
            json(),

            babel({ babelHelpers: "bundled", presets: ["@babel/preset-env"] }),

            dropcompressplugin,
        ],
    },
];
