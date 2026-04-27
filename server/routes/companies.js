const express = require("express");
const router = express.Router();
const Company = require("../models/Company");
const authenticateToken = require("../middleware/auth");

// Create a companies
router.post("/", authenticateToken, async (req, res) => {
  const newCompany = new Company({ ...req.body, created_at: new Date() });
  try {
    const savedCompany = await newCompany.save();
    res.status(201).json(savedCompany);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get public company list (no auth required, limited fields)
router.get("/public", async (req, res) => {
  try {
    const companies = await Company.find({}, "_id company_display_name company_logo");
    res.status(200).json(companies);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all companies
router.get("/", authenticateToken, async (req, res) => {
  try {
    const companies = await Company.find();
    res.status(200).json(companies);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Update a company
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    res.status(200).json(updatedCompany);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete a company
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    await Company.findByIdAndDelete(req.params.id);
    res.status(200).json("Company deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
