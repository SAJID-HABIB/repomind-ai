import { buildImportExportMap } from "./src/modules/api-flow/services/importExport.resolver.js";

const selectedFiles = [
  {
    path: "frontend/src/services/users.js",
    content: `
      export const USER_NAME = "Sajid";
    `,
  },
  {
    path: "frontend/src/services/products.js",
    content: `
      export const PRODUCT_NAME = "Laptop";
    `,
  },
  {
    path: "frontend/src/services/index.js",
    content: `
      export * from "./users.js";
      export * from "./products.js";
    `,
  },
  {
    path: "frontend/src/modules/user/user.api.js",
    content: `
      import { PRODUCT_NAME }
        from "../../services";
    `,
  },
];


const result = buildImportExportMap(selectedFiles);

console.log(JSON.stringify(result, null, 2));
