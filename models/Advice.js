const mongoose = require('mongoose');

const adviceSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer' },
  consumerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consumer' },
  question: String,
  reply: String
}, { timestamps: true });

module.exports = mongoose.model('Advice', adviceSchema);
