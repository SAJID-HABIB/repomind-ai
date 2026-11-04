import { matchEndpoint } from "./src/modules/api-flow/services/endpointMatcher.service.js";
// Test 1: Exact path matching
const test1 = matchEndpoint(
  { method: "GET", url: "/api/users" },
  { method: "GET", path: "/api/users" }
);

// Test 2: Dynamic path matching
const test2 = matchEndpoint(
  { method: "GET", url: "/api/users/25" },
  { method: "GET", path: "/api/users/:id" }
);

// Test 3: Different HTTP methods
const test3 = matchEndpoint(
  { method: "POST", url: "/api/users" },
  { method: "GET", path: "/api/users" }
);

// Test 4: Different paths
const test4 = matchEndpoint(
  { method: "GET", url: "/api/products" },
  { method: "GET", path: "/api/users" }
);

console.log("Test 1 - Exact Path:", test1);
console.log("Test 2 - Dynamic Path:", test2);
console.log("Test 3 - Different Method:", test3);
console.log("Test 4 - Different Path:", test4);