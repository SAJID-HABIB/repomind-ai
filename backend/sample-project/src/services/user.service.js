class UserService {
  async getAllUsers() {
    const fetchUsers = async () => {
      return await User.find({});
    };

    return await fetchUsers();
  }
}

export default UserService;