import {
  extractAxiosInstances,
  resolveImportedAxiosInstances,
} from "./src/modules/api-flow/services/axiosInstance.resolver.js";
import { buildImportExportMap } from "./src/modules/api-flow/services/importExport.resolver.js";

const selectedFiles = [
  {
  path: "frontend/src/services/api.js",
  content: `
    import axios from "axios";

    export const api = axios.create({
      baseURL: "http://localhost:5000/api",
    });

    export const authClient = axios.create({
      baseURL: "http://localhost:5000/auth",
    });
  `,
},
  {
  path: "frontend/src/api/user.api.js",
  content: `
    import * as apiServices from "../services/api.js";

    apiServices.api.get("/users");
    apiServices.authClient.get("/login");
  `,
},
];

const result = buildImportExportMap(selectedFiles);
console.log("IMPORT EXPORT MAP:");
console.log(JSON.stringify(result, null, 2));

const importedInstances = resolveImportedAxiosInstances(selectedFiles, result);

console.log(JSON.stringify(importedInstances, null, 2));
