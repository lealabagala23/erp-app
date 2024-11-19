const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const authenticateToken = require("../middleware/auth");
const Inventory = require("../models/Inventory");

router.post("/", authenticateToken, async (req, res) => {
  const newProduct = new Product({ ...req.body, created_at: new Date() });
  try {
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/", authenticateToken, async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json("Product deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/:id/inventory", authenticateToken, async (req, res) => {
  const { stock_arrival_date, expiry_date, ...rest } = req.body;
  const newInventory = new Inventory({
    product_id: req.params.id,
    stock_arrival_date: new Date(stock_arrival_date),
    expiry_date: new Date(expiry_date),
    ...rest,
    created_at: new Date(),
  });
  try {
    const savedInventory = await newInventory.save();
    res.status(201).json(savedInventory);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/:id/inventory", authenticateToken, async (req, res) => {
  try {
    const inventory = await Inventory.find({
      product_id: req.params.id,
      company_id: req.query.company_id,
    }).populate("supplier_id", ["_id", "supplier_name"]);
    res.status(200).json(inventory);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put(
  "/:id/inventory/:inventory_id",
  authenticateToken,
  async (req, res) => {
    const { stock_arrival_date, expiry_date, ...rest } = req.body;
    const updatedInventory = await Inventory.findByIdAndUpdate(
      req.params.inventory_id,
      {
        product_id: req.params.id,
        stock_arrival_date: new Date(stock_arrival_date),
        expiry_date: new Date(expiry_date),
        ...rest,
      },
      {
        new: true,
      }
    );
    try {
      const savedInventory = await updatedInventory.save();
      res.status(201).json(savedInventory);
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

module.exports = router;
