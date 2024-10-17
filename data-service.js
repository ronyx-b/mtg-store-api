const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const dotenv = require('dotenv');
dotenv.config();

// Define schemas

let userSchema = new Schema({
  "email": {
    "type": String,
    "unique": true
  },
  "name": String,
  "address": [{
    "street": String,
    "city": String,
    "province": String,
    "postal": String
  }],
  "defaultAddress": Number,
  "password": String,
  "isAdmin": {
    "type": Boolean,
    "default": false
  },
  "orders": [String]
});

/** @type {mongoose.Model} */
let User;

let productSchema = new Schema({
  "name": String,
  "prodType": {
    "type": String,
    "default": "sealed"
  },
  "description": String,
  "cardSet": String,
  "price": Number,
  "stock": Number,
  "image": String
});

/** @type {mongoose.Model} */
let Product;

let orderSchema = new Schema({
  "user_id": String,
  "date": Date,
  "address": {
    "street": String,
    "city": String,
    "province": String,
    "postal": String
  },
  "products": [
    {
      "prodType": String,
      "prod_id": String,
      "name": String,
      "cardSet": String,
      "qty": Number,
      "price": Number
    }
  ]
});

/** @type {mongoose.Model} */
let Order;

let featuredSetsSchema = new Schema({
  "name": String,
  "code": String,
  "released_at": Date,
  "scryfall_id": String,
  "hero": String,
  "featured": {
    "type": Boolean,
    "default": false
  }
});

/** @type {mongoose.Model} */
let FeaturedSet;


/**
 * Define the static class that will manage the connection to the database and the models
 */
class DataService {
  /** @type {mongoose.Connection} */
  static connection;

  // /** @type {Object.<string, mongoose.Model>} */
  static model = {
    User,
    Product,
    Order,
    FeaturedSet
  }

  static error = false;

  static async connect() {
    try {
      if (!this.connection?.readyState || this.connection.readyState !== 1) {
        this.connection = await mongoose.createConnection(process.env.MONGODB_CONN_STR).asPromise();
        this.model = {
          User: this.connection.model("users", userSchema),
          Product: this.connection.model("products", productSchema),
          Order: this.connection.model("orders", orderSchema),
          FeaturedSet: this.connection.model("featuredSets", featuredSetsSchema),
        }
        console.log("Connection to DB successful");
      }
    }
    catch (error) {
      console.log('Mongoose connection error:', error);
      DataService.error = error
    }
    return DataService;
  }
}

// Export service

// export default DataService;

module.exports.connect = DataService.connect; // async () => {
//   let db = mongoose.createConnection(process.env.MONGODB_CONN_STR, { useUnifiedTopology: true });
//   db.on('error', (err) => {
//     throw err;
//   });
//   db.once('open', () => {
//     User = db.model("users", userSchema);
//     Product = db.model("products", productSchema);
//     Order = db.model("orders", orderSchema);
//     FeaturedSet = db.model("featuredSets", featuredSetsSchema);
//     return;
//   })
// };

module.exports.listening = async () => {
  return 'Data service connected';
;}

module.exports.getAllProducts = async () => {
  const db = await DataService.connect();

  return db.model.Product.find();
};

module.exports.getProductById = async (productId) => {
  const db = await DataService.connect();

  return db.model.Product.findOne({_id: productId});
};

module.exports.getProductsCollection = async(idArr) => {
  const db = await DataService.connect();

  return db.model.Product.find({ _id: { $in: idArr } });
};

// module.exports.getProductsBySet = async (set) {
//   return Product.find({})
// };

module.exports.addProduct = async (formData) => {
  const db = await DataService.connect();

  try {
    await db.model.Product.create(formData);
    console.log(`${formData.name} was added to the products collection`);
    return;
  }
  catch (err) {
    throw `Error adding product: ${err}`;

  }
};

module.exports.editProduct = async (formData, id) => {
  const db = await DataService.connect();

  return db.model.Product.updateOne({ _id: id }, { $set: { ...formData } });
};

module.exports.registerUser = async (userData) => {
  const db = await DataService.connect();

  try {
    let existingUser = await db.model.User.findOne({ email: userData.email });
    if(!existingUser) {
      hashedPassword = await bcrypt.hash(userData.password, 10);
      let data = {
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
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
      let newUser = new db.model.User(data);
      newUser.save((err) => {
        if(err) {
          throw `Error saving user: ${err}`;
        } else {
          console.log("The new user was saved to the users collection");
          return;
        }
      });
    } else {
      throw "There is a user already registered with the given email";
    }
  } catch (err) {
    throw `Error creating user: ${err}`;
  }
};

module.exports.login = async (userData) => {
  const db = await DataService.connect();

  try {
    let user = await db.model.User.findOne({ email: userData.email });
    if (!user) {
      throw 'no user found with that email';
    } 
    let match = await bcrypt.compare(userData.password, user.password);
    if (match !== true) {
      throw 'the password is incorrect';
    }
    return user;
  } catch (err) {
    throw `cant't log in: ${err}`;
  }
};

module.exports.getUser = async (email) => {
  const db = await DataService.connect();

  return db.model.User.findOne({ email }, ['name', 'email', 'address', 'defaultAddress', 'isAdmin']);
}

module.exports.getFeaturedSets = async () => {
  const db = await DataService.connect();

  return db.model.FeaturedSet.find();
};

module.exports.getFeaturedSet = async (name) => {
  const db = await DataService.connect();

  return db.model.FeaturedSet.findOne({ name });
};

module.exports.addFeaturedSet = async (data) => {
  const db = await DataService.connect();

  try {
    let existingSet = await db.model.FeaturedSet.findOne({ name: data.name });
    if(existingSet) {
      throw "There is a set already registered with the given name";
    }
    let newSet = new db.model.FeaturedSet(data);
      newSet.save((err) => {
        if(err) {
          throw `Error saving set: ${err}`;
        } else {
          console.log("The new card set was saved to the Card Sets collection");
          return;
        }
      });
  } catch (err) {
    throw `Error creating set: ${err}`;
  }
};

module.exports.editFeaturedSet = async (data, id) => {
  const db = await DataService.connect();

  return db.model.FeaturedSet.updateOne({ _id: id }, { $set: { ...data } });
};

module.exports.checkOutOrder = async (order) => {
  const db = await DataService.connect();

  try {
    let newOrder = new db.model.Order(order);
    let orderId;
    newOrder = await newOrder.save();
    orderId = newOrder._id.toString();
    console.log(`The new order has been processed, ID: ${orderId}`);
    return User.updateOne({ _id: order.user_id }, { $push: { orders: orderId } });
  } catch (err) {
    console.log(err);
    return;
  }
};

module.exports.getUserOrders = async (user_id) => {
  const db = await DataService.connect();

  return db.model.Order.find({ user_id });
}