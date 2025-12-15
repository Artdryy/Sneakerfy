const Sneaker = require('../models/Sneaker');

// --- CREATE SNEAKER ---
exports.createSneaker = async (req, res) => {
  try {
    const { brand, model, size, price, condition, description } = req.body;
    
    // Process uploaded files
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `http://localhost:5000/sneakerpic/${file.filename}`);
    }

    const newSneaker = new Sneaker({
      seller: req.user.id,
      brand,
      model,
      size,
      price,
      condition,
      description,
      images: imageUrls
    });

    await newSneaker.save();
    res.status(201).json(newSneaker);

  } catch (error) {
    console.error("Create Sneaker Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// --- GET ALL SNEAKERS ---
exports.getAllSneakers = async (req, res) => {
  try {
    // Populate seller info (username, rating) so we can show it on the card
    const sneakers = await Sneaker.find({ status: 'Available' })
      .populate('seller', 'username sellerScore profilePicture')
      .sort({ createdAt: -1 });
      
    res.json(sneakers);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// --- GET SINGLE SNEAKER ---
exports.getSneakerById = async (req, res) => {
  try {
    const sneaker = await Sneaker.findById(req.params.id)
      .populate('seller', 'username sellerScore profilePicture fullname');
      
    if (!sneaker) return res.status(404).json({ message: "Sneaker not found" });
    
    res.json(sneaker);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// --- DELETE SNEAKER ---
exports.deleteSneaker = async (req, res) => {
  try {
    const sneaker = await Sneaker.findById(req.params.id);
    
    if (!sneaker) return res.status(404).json({ message: "Sneaker not found" });

    // Ensure only the owner can delete
    if (sneaker.seller.toString() !== req.user.id) {
        return res.status(401).json({ message: "Not authorized" });
    }

    await sneaker.deleteOne();
    res.json({ message: "Sneaker removed" });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};