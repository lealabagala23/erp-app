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
    const products = await Product.aggregate([
      {
        $lookup: {
          from: "inventories",
          localField: "_id",
          foreignField: "product_id",
          as: "stocks",
        },
      },
    ]);
    const productsWQty = products.map(({ stocks, ...rest }) => ({
      ...rest,
      total_quantity_on_hand: stocks.reduce(
        (map, { company_id, quantity_on_hand }) => {
          return {
            ...map,
            [company_id]: (map[company_id] || 0) + quantity_on_hand,
          };
        },
        {}
      ),
    }));
    res.status(200).json(productsWQty);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/bulk", authenticateToken, async (req, res) => {
  try {
    const data = req.body; // Assuming JSON data from the client
    const existingProducts = await Product.find();
    const dataWithCreatedAt = data
      .filter((d) => {
        const { product_name, product_description } = d;
        const existing = existingProducts.some(
          (e) =>
            e.product_name.includes(product_name) &&
            e.product_description.includes(product_description)
        );
        return !existing;
      })
      .map((d) => ({
        ...d,
        created_at: new Date(),
      }));
    await Product.insertMany(dataWithCreatedAt); // Insert multiple records
    res.status(200).send("Data uploaded successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error uploading data");
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
