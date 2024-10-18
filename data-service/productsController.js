const DataService = require("./index");

/**
 * Gets a list of all products from the DB 
 * @async
 * @param {{pageSize: number|string, pageNum: number|string}} [pagination] sets pagination por results
 * @returns 
 */
const getAllProducts = async (pagination = {pageSize: 10, pageNum: 1}) => {
  const db = await DataService.connect();
  let productList = [];
  const pageSize = Number(pagination.pageSize);
  const pageNum = Number(pagination.pageNum);
  if (!db.error) {
    productList = await db.model.Product.find(
      {}, 
      null, 
      { 
        limit: pageSize, 
        skip: pageNum > 1 ? (pageNum - 1) * pageSize : 0,
      }
    );
  }
  // db.connection.close();
  return {
    productList,
    pageSize,
    pageNum
  };
};

/**
 * Gets a list of all products from a given set from the DB
 * @async
 * @param {string} set Card set code
 * @param {{pageSize: number|string, pageNum: number|string}} [pagination] sets pagination por results
 * @returns 
 */
const getAllProductsBySet = async (set = "", pagination = {pageSize: 10, pageNum: 1}) => {
  const db = await DataService.connect();
  let productList = [];
  const pageSize = Number(pagination.pageSize);
  const pageNum = Number(pagination.pageNum);
  if (!db.error) {
    productList = await db.model.Product.find(
      { 
        cardSet: set
      }, 
      null, 
      { 
        limit: pageSize, 
        skip: pageNum > 1 ? (pageNum - 1) * pageSize : 0,
      }
    );
  }
  // db.connection.close();
  return {
    productList,
    pageSize,
    pageNum
  };
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

const productsController = {
  getAllProducts,
  getAllProductsBySet,
  getProductDetailsById,
  getProductsCollection,
};

module.exports = productsController;