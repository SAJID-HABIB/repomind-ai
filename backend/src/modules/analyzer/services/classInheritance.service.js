function resolveClassInheritance(files) {
    const classDefinitions = new Map();
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
        const parentFile = inheritance.superClass ? classDefinitions.get(inheritance.superClass) || [] : [];
        return {
            ...inheritance,
            parentFile: parentFile.length === 1 ? parentFile[0] : null
        }
       }) 
    }
    return files;
}
export {resolveClassInheritance};