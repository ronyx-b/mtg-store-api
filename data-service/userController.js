const DataService = require("./index");
const bcrypt = require("bcrypt");

/** @param {{ name: string, street: string, city: string, province: string, postal: string, email: string, password: string, password2: string }} userData */
const registerUser = async (userData) => {
  try {
    if (userData.password !== userData.password2) {
      throw `Passwords don't match`;
    }
    const db = await DataService.connect();
    if (!db.error) {
      let existingUser = await db.model.User.findOne({ email: userData.email });
      if(existingUser) {
        throw "There is a user already registered with the given email";
      }
      let hashedPassword = await bcrypt.hash(userData.password, 10);
      let data = {
        email: userData.email,
        name: userData.name,
        address: [{
          street: userData.street,
          city: userData.city,
          province: userData.province,
          postal: userData.postal
        }],
        defaultAddress: 0,
        password: hashedPassword,
        isAdmin: false
      };
      await db.model.User.create(data);
    }
  }
  catch (error) {
    throw `Error creating user: ${error}`;
  }
}

/** 
 * @async
 * @param {{email: string, password: string}} loginData
 * @returns
 * */
const loginUser = async (loginData) => {
  try {
    const db = await DataService.connect();
    if (!db.error) {
      let user = await db.model.User.findOne({ email: loginData.email });
      if (!user) {
        throw 'no user found with that email';
      } 
      let match = await bcrypt.compare(loginData.password, user.password);
      if (match !== true) {
        throw 'the password is incorrect';
      }
      return user;
    }
  } catch (err) {
    throw `cant't log in: ${err}`;
  }
}

const getUserData = async (id) => {
  try {
    const db = await DataService.connect();
    if (!db.error) {
      const userData = await db.model.User.findById(id, ['name', 'email', 'address', 'defaultAddress', 'isAdmin', 'orders']);
      if (!userData) {
        throw 'user not found';
      }
      return userData; 
    }
  }
  catch (err) {
    throw `error looking for user data: ${err}`;
  }
};

const changePassword = async (id, oldPassword, newPassword) => {
  try {
    const db = await DataService.connect();
    if (db.error) {
      throw new Error("error connecting to DB");
    }
    const userData = await db.model.User.findById(id, ['password']);
    const match = await bcrypt.compare(oldPassword, userData.password);
    if (match !== true) {
      throw 'the old password is incorrect';
    }
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    await db.model.User.findByIdAndUpdate(id, { $set: { password: newHashedPassword } });
    return
  }
  catch (err) {
    throw `error updating password: ${err}`;
  }
};

const userController = {
  registerUser,
  loginUser,
  getUserData,
  changePassword,
}

module.exports = userController;