const express = require("express");
const setsRouter = express.Router();
const setsController = require("../data-service/setsController");
const { uploadSetHero, cloudinaryFileUploader } = require("../utils/fileUploadUtils");

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
    res.status(422).json({ message: err });
  }
});

/**
 * POST add featured set
 */
setsRouter.post("/", uploadSetHero, async (req, res) => {
  try {
    const { name, code, released_at, scryfall_id, featured } = req.body;
    const cldRes = await cloudinaryFileUploader(req.file);
    const hero = cldRes.public_id
    const setData = { name, code, released_at, scryfall_id, featured, hero };
    await setsController.addFeaturedSet(setData);
    res.status(201).json({ success: true, message: "form processed", setData });
  }
  catch (err) {
    res.status(422).json({ success: false, message: err });
  }
});

/**
 * GET a sets details
 */
setsRouter.get("/:code", async (req, res) => {
  try {
    const code = req.params?.code;
    const set = await setsController.getSetByCode(code);
    res.status(200).json({ set });
  }
  catch (err) {
    res.status(422).json({ success: false, message: err });
  }
});

module.exports = setsRouter;