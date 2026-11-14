import { buildImportExportMap } from "./src/modules/api-flow/services/importExport.resolver.js";

const selectedFiles = [
  {
    path: "frontend/src/services/users.js",
    content: `
      export const USER_NAME = "Sajid";
      export const USER_AGE = 21;
    `,
  },
  {
    path: "frontend/src/services/index.js",
    content: `
      export * as services from "./users.js";
    `,
  },
  {
    path: "frontend/src/modules/user/user.api.js",
    content: `
      import * as services from "../../services";
    `,
  },
];


const result = buildImportExportMap(selectedFiles);

console.log(JSON.stringify(result, null, 2));
