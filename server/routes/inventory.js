const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const authenticateToken = require("../middleware/auth");
const Inventory = require("../models/Inventory");

router.post("/", authenticateToken, async (req, res) => {
  const newInventory = new Inventory({
    ...req.body,
    created_at: new Date(),
    updated_at: new Date(),
    last_updated_by: req.user.id,
  });
  try {
    const savedInventory = await newInventory.save();
    res.status(201).json(savedInventory);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/", authenticateToken, async (req, res) => {
  try {
    const expiring = req.query.expiring;
    let expiringQuery = {};
    if (expiring) {
      const daysToExpire = 30 * 6; // 6 months
      const today = new Date();
      const expiryDateThreshold = new Date(today);
      expiryDateThreshold.setDate(today.getDate() + daysToExpire);
      expiringQuery = {
        expiry_date: {
          $lte: expiryDateThreshold, // Expiring within the next 6 months
        },
      };
    }
    const inventory = await Inventory.find({
      company_id: req.query.company_id,
      ...expiringQuery,
    })
      .populate("product_id", [
        "_id",
        "product_name",
        "product_description",
        "product_unit",
      ])
      .populate("supplier_id", ["_id", "supplier_name"])
      .populate("last_updated_by", ["_id", "first_name", "last_name"]);
    res.status(200).json(inventory);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const updatedInventory = await Inventory.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updated_at: new Date(), last_updated_by: req.user.id },
      {
        new: true,
      }
    );
    res.status(200).json(updatedInventory);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
