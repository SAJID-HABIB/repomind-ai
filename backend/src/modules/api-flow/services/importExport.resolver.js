import { parse } from "@babel/parser";
import path from "node:path";

const supportedExtensions = [
    ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
];

function normalizePath(filePath) {
    return path.posix.normalize(
        filePath.replace(/\\/g, "/").replace(/^\.\//, ""),
    );
}