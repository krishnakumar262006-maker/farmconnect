const mongoose = require('mongoose');

const consumerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  state: { type: String, required: true },
  district: { type: String, required: true },
  password: { type: String, required: true }
});

module.exports = mongoose.model('Consumer', consumerSchema);
