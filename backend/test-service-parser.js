import { extractServiceDetails } from "./src/modules/api-flow/services/service.parser.js";

// Test Case 1: Single database call
const testCase1 = `
async function getAllUsers() {
  return await User.find();
}
`;

// Test Case 2: Multiple database calls in one function
const testCase2 = `
async function getUserDetails() {
  const user = await User.findById("123");
  const posts = await Post.find();
  return { user, posts };
}
`;

// Test Case 3: Multiple service functions
const testCase3 = `
async function getAllUsers() {
  return await User.find();
}

async function getUserCount() {
  return await User.countDocuments();
}
`;

// Test Case 4: Function without database calls
const testCase4 = `
function calculateTotal() {
  return 100 + 200;
}
`;

// Test Case 5: Nested function
const testCase5 = `
async function getUserData() {
  function fetchUser() {
    return User.find();
  }

  return fetchUser();
}
`;

// Run all test cases
console.log("\\n========== TEST CASE 1 ==========");
console.dir(extractServiceDetails(testCase1), { depth: null });

console.log("\\n========== TEST CASE 2 ==========");
console.dir(extractServiceDetails(testCase2), { depth: null });

console.log("\\n========== TEST CASE 3 ==========");
console.dir(extractServiceDetails(testCase3), { depth: null });

console.log("\\n========== TEST CASE 4 ==========");
console.dir(extractServiceDetails(testCase4), { depth: null });

console.log("\\n========== TEST CASE 5 ==========");
console.dir(extractServiceDetails(testCase5), { depth: null });