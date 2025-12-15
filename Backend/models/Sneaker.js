const mongoose = require('mongoose');

const sneakerSchema = new mongoose.Schema({
  seller: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  size: { type: Number, required: true },
  price: { type: Number, required: true },
  condition: { 
    type: String, 
    enum: ['New', 'Used - Like New', 'Used - Good', 'Used - Fair'], 
    required: true 
  },
  description: { type: String },
  images: [{ type: String }], // Array of image URLs
  status: { 
    type: String, 
    enum: ['Available', 'Sold', 'Pending'], 
    default: 'Available' 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sneaker', sneakerSchema);