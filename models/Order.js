const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  consumerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consumer', required: true },
  consumerName: String,
  consumerPhone: String,

  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  farmerName: String,

  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      productName: String,
      quantity: Number,
      price: Number,
      total: Number
    }
  ],

  address: {
    name: String,
    phone: String,
    door: String,
    building: String,
    line: String,
    landmark: String,
    mapSrc: String
  },

  payment: {
    method: String,
    provider: String,
    status: { type: String, default: 'Pending' },
    paidAt: Date
  },

  totals: {
    mrp: Number,
    discount: Number,
    couponCode: String,
    couponAmount: Number,
    deliveryFee: Number,
    grandTotal: Number
  },

  status: { type: String, enum: ['Pending','Shipped','Delivered','Cancelled'], default: 'Pending' }

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
