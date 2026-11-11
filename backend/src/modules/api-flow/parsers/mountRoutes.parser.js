import { parse } from "@babel/parser";
import { dirname, join, normalize } from "node:path";

function extractMountRoutes(sourceCode, filePath, extension) {
  const plugins = [];

  if ([".ts", ".tsx"].includes(extension)) {
    plugins.push("typescript");
  }

  if ([".jsx", ".tsx"].includes(extension)) {
    plugins.push("jsx");
  }

  const ast = parse(sourceCode, {
    sourceType: "unambiguous",
    plugins,
  });

  const mountRoutes = [];
  const importedRouters = [];
  const visited = new WeakSet();

  function visit(node) {
    if (!node || typeof node !== "object") {
      return;
    }

    if (visited.has(node)) {
      return;
    }

    visited.add(node);
    if (
      node.type === "ImportDeclaration" &&
      node.source.value.startsWith(".")
    ) {
      node.specifiers.forEach((specifier) => {
        importedRouters.push({
          routerName: specifier.local.name,
          source: node.source.value,
          resolvedPath: normalize(join(dirname(filePath), node.source.value)),
        });
      });
    }
    if (
      node.type === "CallExpression" &&
      node.callee?.type === "MemberExpression" &&
      node.callee.property?.type === "Identifier" &&
      node.callee.property.name === "use"
    ) {
      const prefix = node.arguments[0];
      const router = node.arguments[1];

      if (prefix?.type === "StringLiteral" && router?.type === "Identifier") {
        mountRoutes.push({
          prefix: prefix.value,
          routerName: router.name,
          sourceFile: filePath,
          line: node.loc?.start.line,
        });
      }
    }

    for (const key of Object.keys(node)) {
      if (
        [
          "loc",
          "start",
          "end",
          "extra",
          "comments",
          "leadingComments",
          "trailingComments",
          "innerComments",
        ].includes(key)
      ) {
        continue;
      }

      const value = node[key];

      if (Array.isArray(value)) {
        value.forEach((child) => {
          if (child && typeof child.type === "string") {
            visit(child);
          }
        });
      } else if (
        value &&
        typeof value === "object" &&
        typeof value.type === "string"
      ) {
        visit(value);
      }
    }
  }

  visit(ast.program);

  return {
    mountRoutes,
    importedRouters,
  };
}

export { extractMountRoutes };
