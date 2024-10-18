const express = require("express");
const setsRouter = express.Router();
const setsController = require("../data-service/setsController");

/**
 * GET all featured sets
 */
setsRouter.get("/", async (req, res) => {
  try {
    const pageSize = req.query?.pageSize || 10;
    const pageNum = req.query?.pageNum || 1;
    const featuredSetList = await setsController.getAllFeaturedSets({ pageSize, pageNum });
    res.status(200).json({ featuredSetList });
  }
  catch (err) {
    res.status(422).json({ message: err, error: err });
  }
});

/**
 * POST add featured set
 */
setsRouter.post("/", async (req, res) => {
  try {
    const setData = req.body;
    await setsController.addFeaturedSet(setData);
    res.status(201).json({ success: true, message: "form processed", setData });
  }
  catch (err) {
    res.status(422).json({ message: err, error: err });
  }
});

setsRouter.get("/:code", async (req, res) => {
  try {
    const code = req.params?.code;
    const set = await setsController.getSetByCode(code);
    res.status(200).json({ set });
  }
  catch (err) {
    res.status(422).json({ success: false, message: err, error: err });
  }
});

module.exports = setsRouter;