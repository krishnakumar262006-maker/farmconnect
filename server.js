require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const session = require('express-session');

const app = express();
const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);


// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: "secretKey",
  resave: false,
  saveUninitialized: true
}));

// Serve static frontend files (public folder)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const farmerRoutes = require('./routes/farmerRoutes');
const consumerRoutes = require('./routes/consumerRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/farmer', farmerRoutes);
app.use('/api/consumer', consumerRoutes);
app.use('/api/admin', adminRoutes);

// Serve dashboard routes (Frontend pages)
app.get('/farmer/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/farmerdashboard.html'));
});

app.get('/admin/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admindashboard.html'));
});

app.get('/consumer/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/consumer_dashboard.html'));
});

// Also serve login & signup directly (optional but helpful)
app.get('/consumer/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/consumerlogin.html'));
});
app.get('/consumer/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/consumersignup.html'));
});

// Health check route
app.get('/api/test', (req, res) => res.json({ ok: true }));

// MongoDB Connection
const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farmconnect';
mongoose.connect(MONGO)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}/home.html`));

