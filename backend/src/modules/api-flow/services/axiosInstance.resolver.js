import { parse } from "@babel/parser";
function extractAxiosInstances(sourceCode, filePath) {
  const ast = parse(sourceCode, {
    sourceType: "unambiguous",
    plugins: [".jsx", "typescript"],
  });
  const instances = [];
  function visit(node) {
    if (!node || typeof node !== "object") {
      return;
    }
    if (
      node.type === "VariableDeclarator" &&
      node.id?.type === "Identifier" &&
      node.init?.type === "CallExpression" &&
      node.init.callee?.type === "MemberExpression" &&
      node.init.callee.object?.type === "Identifier" &&
      node.init.callee.object.name === "axios" &&
      node.init.callee.property?.name === "create"
    ) {
      const config = node.init.arguments[0];
      let baseURL = null;
      if (config?.type === "ObjectExpression") {
        const baseURLProperty = config.properties.find(
          (property) =>
            property.type === "ObjectProperty" &&
            property.key.name === "baseURL",
        );
        if (baseURLProperty.value.value) {
          baseURL = baseURLProperty.value.value;
        }
      }
      instances.push({
        instanceName: node.id.name,
        baseURL,
        sourceFile: filePath,
      });
    }
    for (const key of Object.keys(node)) {
      const value = node[key];
      if (Array.isArray(value)) {
        value.forEach(visit);
      } else if (value && typeof value === "object") {
        visit(value);
      }
    }
  }
  visit(ast.program);
  return instances;
}

function resolveImportedAxiosInstances(selectedFiles, importExportMap) {
  const importedInstances = [];

  for (const file of importExportMap) {
    for (const imported of file.imports) {
      console.log("Current file:", file.filePath);
      console.log("Imported module:", imported.source);
      console.log("Resolved path:", imported.resolvedPath);

      for (const specifier of imported.specifiers) {
        const resolvedExport = specifier.resolvedExport;

        if (!resolvedExport) continue;
        const exportName =
          resolvedExport.type === "namespace" ? null : resolvedExport.local;
        const axiosInstance = extractAxiosInstances(
          selectedFiles.find((item) => item.path === resolvedExport.filePath)
            ?.content || "",
          resolvedExport.filePath,
        );
        const matchingInstance = axiosInstance.find(
          (instance) =>
            exportName === null || instance.instanceName === exportName,
        );

        if (!matchingInstance) continue;
        importedInstances.push({
          instanceName: specifier.local,
          originalInstanceName: matchingInstance.instanceName,
          baseURL: matchingInstance.baseURL,
          sourceFile: matchingInstance.sourceFile,
          importedIn: file.filePath,
        });
      }
    }
  }

  return importedInstances;
}

export { extractAxiosInstances, resolveImportedAxiosInstances };
