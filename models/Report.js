const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  raisedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    refPath: "userType", // can be Consumer or Farmer
    required: true 
  },
  userType: { 
    type: String, 
    enum: ["Consumer", "Farmer"], 
    required: true 
  },
  issue: { type: String, required: true },
  status: { type: String }