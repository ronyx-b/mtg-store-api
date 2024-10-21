const mongoose = require("mongoose");

const Schema = mongoose.Schema

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
  "code": {
    "type": String,
    "unique": true
  },
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
module.exports = DataService;