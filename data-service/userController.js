const DataService = require("./index");
const bcrypt = require("bcrypt");
const log4js = require("log4js");

const logger = log4js.getLogger();
logger.level = "debug";

/** 
 * Registers a user
 * @async
 * @param {Object} userData
 * @param {string} userData.name
 * @param {string} userData.email
 * @param {string} [userData.phone]
 * @param {string} userData.street
 * @param {string} userData.city
 * @param {string} userData.province
 * @param {string} userData.postal
 * @param {string} userData.password
 * @param {string} userData.password2
 */
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
        phone: userData?.phone,
        address: [{
          name: userData.name,
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

const addAddress = async (id, newAddress) => {
  try {
    const db = await DataService.connect();
    if (db.error) {
      throw new Error("error connecting to DB");
    }
    await db.model.User.updateOne(
      { _id: id },
      { $push: { address: newAddress } }
    );
  }
  catch (err) {
    throw `error adding address: ${err}`;
  }
};

const editAddress = async (id, updatedAddress) => {
  try {
    const db = await DataService.connect();
    if (db.error) {
      throw new Error("error connecting to DB");
    }
    await db.model.User.updateOne(
      { _id: id, "address._id": updatedAddress._id },
      { $set: { "address.$": updatedAddress } }
    );
  }
  catch (err) {
    throw `error editing address: ${err}`;
  }
};

const deleteAddress = async (id, addressId) => {
  try {
    const db = await DataService.connect();
    if (db.error) {
      throw new Error("error connecting to DB");
    }
    const user = await db.model.User.findById(id);
    if (user.address.length <= 1) {
      throw new Error("cannot delete last address");
    } 
    await db.model.User.updateOne(
      { _id: id },
      { $pull: { address: { _id: addressId } } }
    );
  }
  catch (err) {
    throw `error deleting address: ${err}`;
  }
};

const userController = {
  registerUser,
  loginUser,
  getUserData,
  changePassword,
  addAddress,
  editAddress,
  deleteAddress,
}

module.exports = userController;