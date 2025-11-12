const mongoose = require('mongoose');

const FarmerSchema = new mongoose.Schema({
  name: { type: String },
  phone: { type: String, required: true, unique: true },
  dob: { type: String }, // store as string 'YYYY-MM-DD' to match login input easily
  state: { type: String },
  district: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Farmer', FarmerSchema);
