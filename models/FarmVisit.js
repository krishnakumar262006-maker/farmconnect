const mongoose = require('mongoose');

const farmVisitSchema = new mongoose.Schema({
  consumerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consumer', required: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  remarks: { type: String, default: '' },
  farmPhotos: [String]
}, { timestamps: true });

module.exports = mongoose.model('FarmVisit', farmVisitSchema);
