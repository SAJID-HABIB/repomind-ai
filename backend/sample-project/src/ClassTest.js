class User {
    name = "Guest";
age = 20;
  constructor(name) {
    this.name = name;
  }

  static role = "Admin";
  #password = "12345";

  static #secretKey = "abc123";

  #getSecret() {
  return "secret";
}

  getName() {
    return this.name;
  }

  getArrowFunction() {
  const greet = (name) => {
    return `Hello ${name}`;
  };

  return greet("User");
}

  static createGuest() {
    return new User("Guest");
  }

  get displayName() {
    return this.name;
  }

  set displayName(value) {
    this.name = value;
  }
  async fetchUser() {
  return await Promise.resolve("User loaded");
}
static async fetchData(url) {
  return await Promise.resolve(`Data from ${url}`);
}
static #getToken() {
  return "secret-token";
}
}

const greet = (name) => {
  return `Hello ${name}`;
};

function outerFunction(a) {
  function innerFunction(b) {
    return a + b;
  }

  return innerFunction(5);

}

export default User;