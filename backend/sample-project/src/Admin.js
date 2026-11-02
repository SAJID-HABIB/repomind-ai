import User from "./ClassTest.js";

class Admin extends User {
  deleteUser() {
    return true;
  }
}

export default Admin;
