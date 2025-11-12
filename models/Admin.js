const mongoose = require('mongoose');
const adminSchema = new mongoose.Schema({
  username: String,
  password: String // store hashed or plain for now
});
module.exports = mongoose.model('Admin', adminSchema);
