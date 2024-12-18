const express = require("express");
const router = express.Router();
const Referrer = require("../models/Referrer");
const authenticateToken = require("../middleware/auth");

// Create a companies
router.post("/", authenticateToken, async (req, res) => {
  const newReferrer = new Referrer({ ...req.body, created_at: new Date() });
  try {
    const savedReferrer = await newReferrer.save();
    res.status(201).json(savedReferrer);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all companies
router.get("/", authenticateToken, async (req, res) => {
  try {
    const companies = await Referrer.aggregate([
      {
        $lookup: {
          from: "doctors",
          localField: "doctor_id",
          foreignField: "_id",
          as: "doctor_id",
        },
      },
      {
        $unwind: {
          path: "$doctor_id",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "doctor_id.customer_id",
          foreignField: "_id",
          as: "doctor_id.customer_id",
        },
      },
      {
        $unwind: {
          path: "$doctor_id.customer_id",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    res.status(200).json(companies);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Update a referrer
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const updatedReferrer = await Referrer.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    res.status(200).json(updatedReferrer);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete a referrer
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    await Referrer.findByIdAndDelete(req.params.id);
    res.status(200).json("Referrer deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
