function greet(name) {
  return `Hello ${name}`;
}

const add = (a, b) => a + b;

function Navbar({ onMenuClick }) {
  return onMenuClick;
}

const fetchData = async (url) => {
  return url;
};

export default Navbar;

// Default parameter
function greetWithDefault(name = "Sajid") {
  return name;
}

// Rest parameter
function sum(...numbers) {
  return numbers;
}

// Function expression
const multiply = function (a, b) {
  return a * b;
};

// Nested destructuring
function createUser({ profile: { name } }) {
  return name;
}