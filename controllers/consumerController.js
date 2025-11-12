const Consumer = require('../models/Consumer');
const bcrypt = require('bcryptjs');

// Consumer Signup
exports.signup = async (req, res) => {
  try {
    const { username, password } = req.body;

    const existing = await Consumer.findOne({ username });
    if (existing) return res.status(400).json({ success: false, message: "User already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const consumer = new Consumer({ username, passwordHash });
    await consumer.save();

    res.json({ success: true, message: "Signup successful", consumer });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Consumer Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const consumer = await Consumer.findOne({ username });
    if (!consumer) return res.status(400).json({ success: false, message: "User not found" });

    const match = await bcrypt.compare(password, consumer.passwordHash);
    if (!match) return res.status(400).json({ success: false, message: "Invalid credentials" });

    res.json({ success: true, message: "Login successful", consumer });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
