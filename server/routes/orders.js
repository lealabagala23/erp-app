const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const authenticateToken = require("../middleware/auth");

// Create a companies
router.post("/", authenticateToken, async (req, res) => {
  const newOrder = new Order({ ...req.body, created_at: new Date() });
  try {
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all companies
router.get("/", authenticateToken, async (req, res) => {
  try {
    const companies = await Order.find();
    res.status(200).json(companies);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Update a Order
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete a Order
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json("Order deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
