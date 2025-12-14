const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // --- Personal Info ---
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullname: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  
  // --- Location Data ---
  country: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  postalCode: { type: String, required: true },

  // --- System Data ---
  role: { 
    type: String, 
    enum: ['user', 'admin', 'moderator'], 
    default: 'user' 
  },
  sellerScore: { type: Number, default: 0 },
  permissions: { type: [String], default: [] },
  profilePicture: { 
    type: String, 
    default: "" 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);