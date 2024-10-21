const express = require("express");
const productsRouter = express.Router();
const productsController = require("../data-service/productsController");
const { uploadProductImage, cloudinaryFileUploader } = require("../utils/fileUploadUtils");

/**
 * GET all products, paginated
 */
productsRouter.get("/", async (req, res) => {
  try {
    const pageSize = req.query?.pageSize || 10;
    const pageNum = req.query?.pageNum || 1;
    const results = await productsController.getAllProducts({ pageSize, pageNum });
    res.status(200).json(results);
  }
  catch (err) {
    res.status(422).json({ message: err, error: err });
  }
});

/**
 * POST add a new product
 */
productsRouter.post("/", uploadProductImage, async (req, res) => {
  try {
    const cldRes = await cloudinaryFileUploader(req.file);
    let formData = { ...req.body, image: cldRes.public_id };
    await productsController.addNewProduct(formData);
    res.status(201).json({ success: true, message: "form processed", formData });
  } catch (err) {
    res.status(422).json({ success: false, message: `Error: ${err}` })
  }
});

/**
 * POST get details of a list of products
 */
productsRouter.post("/collection", async (req, res) => {
  try {
    const productIdList = req.body?.productIdList || [];
    const products = await productsController.getProductsCollection(productIdList);
    res.status(200).json({ products });
  }
  catch (err) {
    res.status(422).json({ message: err, error: err });
  }
});

/**
 * GET all products from a given set
 */
productsRouter.get("/set/:id", async (req, res) => {
  try {
    const set = req.params?.id;
    const pageSize = req.query?.pageSize || 10;
    const pageNum = req.query?.pageNum || 1;
    const results = await productsController.getAllProductsBySet(set, { pageSize, pageNum });
    res.status(200).json(results);
  }
  catch (err) {
    res.status(422).json({ message: err, error: err });
  }
});

/**
 * GET details of a product
 */
productsRouter.get("/:id", async (req, res) => {
  try {
    const id = req.params?.id;
    const productDetails = await productsController.getProductDetailsById(id);
    res.status(200).json({ productDetails });
  }
  catch (err) {
    res.status(422).json({ message: err, error: err });
  }
});

/* ******************** TODO ******************** */
/**
 * PUT update details of a product
 */
productsRouter.put("/:id", async (req, res) => {
  try {
    const id = req.params?.id;
    const formData = req.body
    res.status(200).json({ id, formData });
  }
  catch (err) {
    res.status(422).json({ message: err, error: err });
  }
});

module.exports = productsRouter;