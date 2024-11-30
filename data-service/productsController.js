const DataService = require("./index");

/**
 * Gets a list of all products from the DB 
 * @async
 * @param {{pageSize: number|string, pageNum: number|string}} [pagination] sets pagination por results
 * @returns 
 */
const getAllProducts = async (pagination = {pageSize: 20, pageNum: 1}) => {
  try {
    const db = await DataService.connect();
    // let productList = [];
    const pageSize = Number(pagination.pageSize);
    const pageNum = Number(pagination.pageNum);
    if (db.error) {
      throw new Error("error connecting to DB");
    }
    const count = await db.model.Product.countDocuments();
    if (count < (pageSize * (pageNum - 1))) {
      throw new Error("page out of range");
    }
    const productList = await db.model.Product.find(
      {}, 
      null, 
      { 
        limit: pageSize, 
        skip: pageNum > 1 ? (pageNum - 1) * pageSize : 0,
      }
    );
    return {
      productList,
      pageSize,
      pageNum,
      count
    };
  }
  catch (err) {
    throw `error looking for products data: ${err}`;
  }
};

/**
 * Gets a list of all products from a given set from the DB
 * @async
 * @param {string} set Card set code
 * @param {{pageSize: number|string, pageNum: number|string}} [pagination] sets pagination por results
 * @returns 
 */
const getAllProductsBySet = async (set = "", pagination = {pageSize: 4, pageNum: 1}) => {
  try {
    const db = await DataService.connect();
    const pageSize = Number(pagination.pageSize);
    const pageNum = Number(pagination.pageNum);
    if (db.error) {
      throw new Error("error connecting to DB");
    }
    const count = await db.model.Product.countDocuments({ cardSet: set });
    if (count < (pageSize * (pageNum - 1))) {
      throw new Error("page out of range");
    }
    const productList = await db.model.Product.find(
      { 
        cardSet: set
      }, 
      null, 
      { 
        limit: pageSize, 
        skip: pageNum > 1 ? (pageNum - 1) * pageSize : 0,
      }
    );
    return {
      productList,
      pageSize,
      pageNum,
      count
    };
  }
  catch (err) {

  }

}

const getProductDetailsById = async (id) => {
  const db = await DataService.connect();
  let productDetails = {};
  if (!db.error) {
    productDetails = await db.model.Product.findById(id);
  }
  return productDetails;
}

const getProductsCollection = async([ ...idArr ]) => {
  const db = await DataService.connect();
  let productList = [];
  if (!db.error) {
    productList = await db.model.Product.find({ _id: { $in: idArr } });
  }
  return productList;
};

const addNewProduct = async (formData) => {
  try {
    const db = await DataService.connect();
    if (!db.error) {
      await db.model.Product.create(formData);
    }
  }
  catch (err) {
    throw `Error creating set: ${err}`;
  }
}

const editProduct = async (id, formData) => {
  try {
    const db = await DataService.connect();
    if (!db.error) {
      await db.model.Product.updateOne({ _id: id }, { $set: { ...formData } });
    }
  }
  catch (err) {
    throw `Error creating set: ${err}`;
  }
}

const productsController = {
  getAllProducts,
  getAllProductsBySet,
  getProductDetailsById,
  getProductsCollection,
  addNewProduct,
  editProduct,
};

module.exports = productsController;