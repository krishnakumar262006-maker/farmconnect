const Farmer = require('../models/Farmer');
const bcrypt = require('bcryptjs');

// Farmer Signup
exports.signup = async (req, res) => {
  try {
    const { name, phone, dob } = req.body;

    // check if exists
    const existing = await Farmer.findOne({ phone });
    if (existing) return res.status(400).json({ success: false, message: "Farmer already exists" });

    // hash dob
    const dobHash = await bcrypt.hash(dob, 10);
    const farmer = new Farmer({ name, phone, dobHash });
    await farmer.save();

    res.json({ success: true, message: "Signup successful", farmer });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Farmer Login
exports.login = async (req, res) => {
  try {
    const { phone, dob } = req.body;
    const farmer = await Farmer.findOne({ phone });
    if (!farmer) return res.status(400).json({ success: false, message: "Farmer not found" });

    const match = await bcrypt.compare(dob, farmer.dobHash);
    if (!match) return res.status(400).json({ success: false, message: "Invalid credentials" });

    res.json({ success: true, message: "Login successful", farmer });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
