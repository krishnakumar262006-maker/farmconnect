const express = require("express");
const router = express.Router();
const Farmer = require("../models/Farmer");
const Consumer = require("../models/Consumer");
const Product = require("../models/Product");

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
    return res.json({ success: true, admin: { _id: "1", username } });
  }
  res.json({ success: false, message: "Invalid credentials" });
});

// Get all farmers
router.get("/farmers", async (req, res) => {
  try {
    const farmers = await Farmer.find();
    res.json(farmers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch farmers" });
  }
});

// Get all consumers
router.get("/consumers", async (req, res) => {
  try {
    const consumers = await Consumer.find();
    res.json(consumers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch consumers" });
  }
});

// Get all products
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find().populate("farmerId", "name email");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Approve product
router.put("/approve-product/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to approve product" });
  }
});

// Reject product
router.put("/reject-product/:id", async (req, res) => {
  try {
    const { remark } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status: "rejected", remark },
      { new: true }
    );
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to reject product" });
  }
});

// Get reports
router.get("/reports", async (req, res) => {
  try {
    const reports = await Report.find().populate("userId", "name email");
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

module.exports = router;
