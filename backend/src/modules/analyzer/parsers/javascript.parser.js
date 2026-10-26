import { parse } from "@babel/parser";

function extractParameterNames(param) {
  if (param.type === "Identifier") {
    return [param.name];
  }

  if (param.type === "RestElement") {
    return extractParameterNames(param.argument).map((name) => `...${name}`);
  }

  if (param.type === "AssignmentPattern") {
    return extractParameterNames(param.left);
  }

  if (param.type === "ObjectPattern") {
    return param.properties.flatMap((property) => {
      if (property.type === "RestElement") {
        return extractParameterNames(property);
      }

      return extractParameterNames(property.value);
    });
  }

  if (param.type === "ArrayPattern") {
    return param.elements.flatMap((element) =>
      element ? extractParameterNames(element) : [],
    );
  }

  return ["destructured"];
}

function analyzeJavaScriptSource(sourceCode, extension) {
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

  const functions = [];
  const functionDetails = [];
  const classes = [];
  const imports = [];
  const exports = [];

  function visit(node) {
    if (!node || typeof node !== "object") {
      return;
    }

    if (node.type === "FunctionDeclaration" && node.id?.name) {
      functions.push(node.id.name);

      functionDetails.push({
        name: node.id.name,
        parameters: node.params.flatMap(extractParameterNames),
      });
    }

    if (
      node.type === "VariableDeclarator" &&
      node.id?.type === "Identifier" &&
      ["ArrowFunctionExpression", "FunctionExpression"].includes(
        node.init?.type,
      )
    ) {
      functions.push(node.id.name);

      functionDetails.push({
        name: node.id.name,
        parameters: node.init.params.flatMap(extractParameterNames),
      });
    }

    if (node.type === "ClassDeclaration" && node.id?.name) {
      classes.push(node.id.name);
    }

    if (node.type === "ImportDeclaration") {
      imports.push(node.source.value);
    }

    if (node.type === "ExportNamedDeclaration") {
      if (node.source) {
        imports.push(node.source.value);
      }

      if (node.declaration) {
        const declaration = node.declaration;

        if (declaration.id?.name) {
          exports.push(declaration.id.name);
        }

        if (declaration.declarations) {
          for (const item of declaration.declarations) {
            if (item.id?.name) {
              exports.push(item.id.name);
            }
          }
        }
      }
    }

    if (node.type === "ExportDefaultDeclaration") {
      const declaration = node.declaration;

      const exportName =
        declaration?.id?.name ||
        declaration?.declarations?.[0]?.id?.name ||
        (declaration?.type === "Identifier" ? declaration.name : null);

      exports.push(exportName ? `default ${exportName}` : "default");
    }

    if (node.type === "ExportAllDeclaration" && node.source) {
      exports.push(`* from ${node.source.value}`);
    }

    for (const specifier of node.specifiers ?? []) {
      const exportName = specifier.exported?.name ?? specifier.exported?.value;

      if (exportName) {
        exports.push(exportName);
      }
    }

    for (const value of Object.values(node)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          visit(item);
        }
      } else if (value && typeof value === "object") {
        visit(value);
      }
    }
  }

  visit(ast.program);

  return {
    functions,
    functionDetails,
    classes,
    imports,
    exports,
  };
}

export { analyzeJavaScriptSource };
