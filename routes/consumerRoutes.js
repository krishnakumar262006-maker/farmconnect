const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const Consumer = require('../models/Consumer');
const Product = require('../models/Product');
const consumerController = require("../controllers/consumerController");
const FarmVisit = require('../models/FarmVisit');
const Advice = require('../models/Advice');
const Farmer = require('../models/Farmer');

// ✅ Consumer Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, password, state, district, dob } = req.body;

    // Check required fields
    if (!name || !email || !phone || !password || !state || !district || !dob) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Check if email already exists
    const existing = await Consumer.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save new consumer with dob
    const consumer = new Consumer({
      name,
      dob,
      email,
      phone,
      state,
      district,
      password: hashedPassword
    });

    await consumer.save();

    res.json({ success: true, message: "Signup successful", consumer });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const consumer = await Consumer.findOne({ email });
    if (!consumer) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, consumer.password);
    if (!match) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Successful login
    res.json({ success: true, consumer, redirect: '/consumer/dashboard' });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ Get only approved products for consumers
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find({ status: "approved" });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get single product by ID (for cart/order pages)
router.get("/product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get all advices
router.get('/advice', async (req, res) => {
  try {
    const advices = await Advice.find().populate('farmerId','name state district').sort({ createdAt:-1 });
    res.json(advices);
  } catch(err){
    console.error(err);
    res.status(500).json({ success:false, message:'Error' });
  }
});

// ✅ Request farm visit
router.post('/visit/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;
    const { consumerId, date } = req.body;
    if (!consumerId || !date)
      return res.status(400).json({ success:false, message:'consumerId and date required' });
    const visit = new FarmVisit({ consumerId, farmerId, date });
    await visit.save();
    res.json({ success:true, visit });
  } catch(err){
    console.error(err);
    res.status(500).json({ success:false, message:'Error' });
  }
});

// ✅ Get consumer's visits
router.get('/my-visits/:consumerId', async (req, res) => {
  try {
    const visits = await FarmVisit.find({ consumerId: req.params.consumerId })
      .populate('farmerId','name state district');
    res.json(visits);
  } catch(err){
    console.error(err);
    res.status(500).json({ success:false, message:'Error' });
  }
});

// ✅ Ask advice
router.post('/ask/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;
    const { consumerId, question } = req.body;
    if (!consumerId || !question)
      return res.status(400).json({ success:false, message:'consumerId and question required' });
    const adv = new Advice({ consumerId, farmerId, question });
    await adv.save();
    res.json({ success:true, adv });
  } catch(err){
    console.error(err);
    res.status(500).json({ success:false, message:'Error' });
  }
});

module.exports = router;
