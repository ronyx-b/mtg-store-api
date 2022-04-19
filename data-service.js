const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const dotenv = require('dotenv');
dotenv.config();

// mongoose.connect(process.env.MONGODB_CONN_STR);

// Define schemas

let userSchema = new Schema({
  "email": {
    "type": String,
    "unique": true
  },
  "first_name": String,
  "last_name": String,
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
  }
});
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
let FeaturedSet;

module.exports.connect = async () => {
  let db = mongoose.createConnection(process.env.MONGODB_CONN_STR, { useUnifiedTopology: true });
  db.on('error', (err) => {
    throw err;
  });
  db.once('open', () => {
    User = db.model("users", userSchema);
    Product = db.model("products", productSchema);
    Order = db.model("orders", orderSchema);
    FeaturedSet = db.model("featuredSets", featuredSetsSchema);
    return;
  })
};

module.exports.listening = async () => {
  return 'Data service connected';
;}

module.exports.getAllProducts = async () => {
  return Product.find().exec();
};

module.exports.getProductById = async (productId) => {
  return Product.findOne({_id: productId}).exec();
};

module.exports.getProductsCollection = async(idArr) => {
  return Product.find({ _id: { $in: idArr } }).exec();
};

// module.exports.getProductsBySet = async (set) {
//   return Product.find({})
// };

module.exports.addProduct = async (formData) => {
  let newProduct = new Product(formData);
  newProduct.save((err) => {
    if(err) {
      throw `Error adding product: ${err}`;
    } else {
      console.log(`${formData.name} was added to the products collection`);
      return;
    }
  });
};

module.exports.editProduct = async (formData, id) => {
  return Product.updateOne({ _id: id }, { $set: { ...formData } }).exec();
};

module.exports.registerUser = async (userData) => {
  try {
    existingUser = await User.findOne({ email: userData.email }).exec();
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
      let newUser = new User(data);
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
  try {
    let user = await User.findOne({ email: userData.email }).exec();
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

module.exports.getFeaturedSets = async () => {
  return FeaturedSet.find().exec();
};

module.exports.getFeaturedSet = async (name) => {
  return FeaturedSet.findOne({ name }).exec();
};

module.exports.addFeaturedSet = async (data) => {
  try {
    existingSet = await FeaturedSet.findOne({ name: data.name }).exec();
    if(!existingSet) {
      let newSet = new FeaturedSet(data);
      newSet.save((err) => {
        if(err) {
          throw `Error saving set: ${err}`;
        } else {
          console.log("The new card set was saved to the Card Sets collection");
          return;
        }
      });
    } else {
      throw "There is a set already registered with the given name";
    }
  } catch (err) {
    throw `Error creating set: ${err}`;
  }
};

module.exports.editFeaturedSet = async (data, id) => {
  return FeaturedSet.updateOne({ _id: id }, { $set: { ...data } }).exec();
};