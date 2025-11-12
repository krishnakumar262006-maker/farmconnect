// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Create new order
router.post('/place', async (req, res) => {
  try {
    const orderData = req.body;
    if (!orderData.consumerId) {
      return res.status(400).json({ message: 'Missing consumerId' });
    }

    const order = new Order(orderData);
    await order.save();

    res.status(201).json({ message: 'Order stored successfully', order });
  } catch (error) {
    console.error('Order save error:', error);
    res.status(500).json({ message: 'Failed to store order', error: error.message });
  }
});

module.exports = router;
