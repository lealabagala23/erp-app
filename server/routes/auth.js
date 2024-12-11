const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authenticateToken = require("../middleware/auth");

require("dotenv").config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Register a new user
router.post("/register", async (req, res) => {
  const { username, password, first_name, last_name } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
      first_name,
      last_name,
    });
    await newUser.save();
    res.status(201).send("User registered successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error registering user");
  }
});

// Login a user
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).send("Invalid username or password");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Invalid username or password");

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "6h" });
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error logging in");
  }
});

// Get current user
router.get("/me", authenticateToken, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

router.post("/change-password", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const match = await bcrypt.compare(req.body.oldPassword, user?.password);
    if (!match) {
      res.status(500).send("Incorrect password");
      return;
    }

    const newPassword = await bcrypt.hash(req.body.newPassword, 10);
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { password: newPassword },
      {
        new: true,
      }
    );
    await updatedUser.save();
    res.status(201).send("User registered successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error registering user");
  }
});

module.exports = router;
