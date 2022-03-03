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
  "address": String,
  "city": String,
  "postal": String,
  "password": String,
  "role": {
    "type": String,
    "default": "customer"
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

module.exports.connect = async () => {
  let db = mongoose.createConnection(process.env.MONGODB_CONN_STR, { useUnifiedTopology: true });
  db.on('error', (err) => {
    throw err;
  });
  db.once('open', () => {
    User = db.model("users", userSchema);
    Product = db.model("products", productSchema);
    return;
  })
}

module.exports.listening = async () => {
  return 'Data service connected';
}

module.exports.addProduct = async (data) => {
  let newProduct = new Product(data);
  newProduct.save((err) => {
    if(err) {
      throw `There was an error creating the product: ${err}`;
    } else {
      console.log('product added');
      return;
    }
  });
}

module.exports.getAllProducts = async () => {
  return Product.find().exec();
}