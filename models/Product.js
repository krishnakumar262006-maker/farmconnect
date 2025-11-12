const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  type: String,
  price: Number,
  image: String,
  description: String,
  status: { type: String, default: "pending" },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer" }
});

module.exports = mongoose.model("Product", productSchema);
