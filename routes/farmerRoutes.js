const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const Farmer = require('../models/Farmer');
const Product = require('../models/Product');
const FarmVisit = require('../models/FarmVisit');
const Advice = require('../models/Advice');
const Order = require('../models/Order');

// Multer config - store into public/uploads
const uploadDir = path.join(__dirname, '../public/uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g,'_'));
  }
});
const upload = multer({ storage });

// ---------------- LOGIN (fixed) ----------------
// Expect JSON: { phone, dob } where dob is string e.g., '1990-01-01'
router.post('/login', async (req, res) => {
  try {
    const { phone, dob } = req.body;
    if (!phone || !dob) return res.status(400).json({ success:false, message:'Phone and DOB required' });

    const farmer = await Farmer.findOne({ phone });
    if (!farmer) return res.status(400).json({ success:false, message:'Invalid credentials' });

    // compare as strings (store DOB in DB in same string format)
    if ((farmer.dob || '').trim() !== (dob || '').trim()) {
      return res.status(400).json({ success:false, message:'Invalid credentials' });
    }

    res.json({ success:true, farmer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message:'Server error' });
  }
});

// ---------------- SIGNUP (optional) ----------------
router.post('/signup', async (req, res) => {
  try {
    const { name, phone, dob, state, district } = req.body;
    if (!phone || !dob || !name) return res.status(400).json({ success:false, message:'Required fields missing' });
    const exists = await Farmer.findOne({ phone });
    if (exists) return res.status(400).json({ success:false, message:'Phone already registered' });
    const farmer = new Farmer({ name, phone, dob, state, district });
    await farmer.save();
    res.json({ success:true, farmer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message:'Server error' });
  }
});

// ---------------- Add Product (multipart/form-data) ----------------
router.post('/add-product', upload.array('images', 6), async (req, res) => {
  try {
    const { farmerId, name, type, price, quantity } = req.body;
    if (!farmerId || !name || !type || price == null || quantity == null) {
      return res.status(400).json({ success:false, message:'All fields required' });
    }

    const farmer = await Farmer.findById(farmerId);
    if (!farmer) return res.status(404).json({ success:false, message:'Farmer not found' });

    const images = (req.files || []).map(f => '/uploads/' + f.filename);
    const product = new Product({ farmerId, name, type, price, quantity, images, status:'pending' });
    await product.save();
    res.json({ success:true, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message:'Error adding product' });
  }
});

// ---------------- Get Products by Farmer ----------------
router.get('/products/:farmerId', async (req, res) => {
  try {
    const products = await Product.find({ farmerId: req.params.farmerId }).sort({ createdAt:-1 });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message:'Error fetching products' });
  }
});

// ---------------- Delete Product (and images) ----------------
router.delete('/product/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success:false, message:'Not found' });

    // delete files from public/uploads
    if (product.images && product.images.length) {
      for (const imgPath of product.images) {
        const fullPath = path.join(__dirname, '../public', imgPath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      }
    }

    await product.deleteOne();
    res.json({ success:true, message:'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message:'Error deleting product' });
  }
});

// ---------------- Farm Visits ----------------
router.get('/farm-visit/:farmerId', async (req, res) => {
  try {
    const visits = await FarmVisit.find({ farmerId: req.params.farmerId }).populate('consumerId','name phone email');
    res.json(visits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message:'Error' });
  }
});

router.put('/farm-visit/:id', async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const visit = await FarmVisit.findById(req.params.id);
    if (!visit) return res.status(404).json({ success:false, message:'Not found' });
    if (status) visit.status = status;
    if (remarks !== undefined) visit.remarks = remarks;
    await visit.save();
    res.json({ success:true, visit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message:'Error updating visit' });
  }
});

// optionally allow upload farm photos for a visit
router.post('/farm-visit/upload/:id', upload.array('photos', 6), async (req, res) => {
  try {
    const visit = await FarmVisit.findById(req.params.id);
    if (!visit) return res.status(404).json({ success:false, message:'Not found' });
    const photos = (req.files||[]).map(f => '/uploads/' + f.filename);
    visit.farmPhotos = visit.farmPhotos.concat(photos);
    await visit.save();
    res.json({ success:true, visit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message:'Error uploading photos' });
  }
});

// ---------------- Advice ----------------
router.get('/advice/:farmerId', async (req, res) => {
  try {
    const adv = await Advice.find({ farmerId: req.params.farmerId }).populate('consumerId','name email phone');
    res.json(adv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message:'Error loading advice' });
  }
});

router.post('/advice/reply/:id', async (req, res) => {
  try {
    const { reply } = req.body;
    const adv = await Advice.findByIdAndUpdate(req.params.id, { reply }, { new: true });
    res.json({ success:true, adv });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message:'Error replying' });
  }
});

// ---------------- Orders ----------------
// Get all orders for farmer's products
router.get('/orders/:farmerId', async (req, res) => {
  try {
    const orders = await Order.find({ farmerId: req.params.farmerId })
      .populate('consumerId','name email')
      .populate('productId','name price');
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message:'Error fetching orders' });
  }
});

// Update order status
router.put('/orders/:id', async (req,res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success:false, message:'Order not found' });
    order.status = status;
    await order.save();
    res.json({ success:true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message:'Error updating order' });
  }
});

module.exports = router;
