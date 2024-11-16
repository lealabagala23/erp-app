const express = require("express");
const router = express.Router();
const Supplier = require("../models/Supplier");
const authenticateToken = require("../middleware/auth");

// Create a supplier
router.post("/", authenticateToken, async (req, res) => {
  const newSupplier = new Supplier({ ...req.body, created_at: new Date() });
  try {
    const savedSupplier = await newSupplier.save();
    res.status(201).json(savedSupplier);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all supplier
router.get("/", authenticateToken, async (req, res) => {
  try {
    const supplier = await Supplier.find();
    res.status(200).json(supplier);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Update a Supplier
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const updatedSupplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    res.status(200).json(updatedSupplier);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete a Supplier
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.status(200).json("Supplier deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
