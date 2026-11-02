import { resolveLocalDependency } from "./dependency.service.js";
function resolveClassInheritance(files) {
  const classDefinitions = new Map();
  const filePaths = new Set(files.map((file) => file.file));
  for (const file of files) {
    for (const className of file.classes || []) {
      if (!classDefinitions.has(className)) {
        classDefinitions.set(className, []);
      }
      classDefinitions.get(className).push(file.file);
    }
  }
  for (const file of files) {
    file.classInheritance = (file.classInheritance || []).map((inheritance) => {
      const matchingImport = (file.importDetails || []).find(
        (details) => details.localName === inheritance.superClass,
      );
      let parentFile = [];
      if (matchingImport && matchingImport.importedName !== "*") {
        const resolvedFile = resolveLocalDependency(
          file.file,
          matchingImport.source,
          filePaths,
        );
        if (
          resolvedFile &&
          files.some(
            (targetFile) =>
              targetFile.file === resolvedFile &&
              (matchingImport.importedName === "default" ||
                (targetFile.classes || []).includes(
                  matchingImport.importedName,
                )),
          )
        ) {
          parentFile = [resolvedFile];
        }
      }
      if (parentFile.length === 0) {
        parentFile = inheritance.superClass
          ? classDefinitions.get(inheritance.superClass) || []
          : [];
      }
      return {
        ...inheritance,
        parentFile: parentFile.length === 1 ? parentFile[0] : null,
      };
    });
  }
  return files;
}
export { resolveClassInheritance };
