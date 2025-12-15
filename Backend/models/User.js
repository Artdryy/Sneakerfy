const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Who gave the rating
  score: { type: Number, required: true, min: 1, max: 5 }, // 1-5 stars
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  // --- Personal Info ---
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
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
  ratings: [ratingSchema], // Array of ratings
  permissions: { type: [String], default: [] },
  profilePicture: { 
    type: String, 
    default: "" 
  },
  
  // --- Account Verification ---
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  verificationCodeExpires: { type: Date },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);