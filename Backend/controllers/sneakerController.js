const Sneaker = require('../models/Sneaker');

exports.createSneaker = async (req, res) => {
  try {
    const { brand, model, size, price, condition, description } = req.body;
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `http://localhost:5000/sneakerpic/${file.filename}`);
    }
    const newSneaker = new Sneaker({
      seller: req.user.id,
      brand, model, size, price, condition, description, images: imageUrls
    });
    await newSneaker.save();
    res.status(201).json(newSneaker);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getAllSneakers = async (req, res) => {
  try {
    const sneakers = await Sneaker.find({ status: 'Available' })
      .populate('seller', 'username sellerScore profilePicture')
      .sort({ createdAt: -1 });
    res.json(sneakers);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getSneakerById = async (req, res) => {
  try {
    const sneaker = await Sneaker.findById(req.params.id)
      .populate('seller', 'username sellerScore profilePicture fullname')
      .populate('comments.user', 'username profilePicture'); 
    if (!sneaker) return res.status(404).json({ message: "Sneaker not found" });
    res.json(sneaker);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.deleteSneaker = async (req, res) => {
  try {
    const sneaker = await Sneaker.findById(req.params.id);
    if (!sneaker) return res.status(404).json({ message: "Sneaker not found" });
    if (sneaker.seller.toString() !== req.user.id) {
        return res.status(401).json({ message: "Not authorized" });
    }
    await sneaker.deleteOne();
    res.json({ message: "Sneaker removed" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const sneaker = await Sneaker.findById(req.params.id);
    if (!sneaker) return res.status(404).json({ message: "Sneaker not found" });
    const newComment = { user: req.user.id, text };
    sneaker.comments.unshift(newComment);
    await sneaker.save();
    const updatedSneaker = await Sneaker.findById(req.params.id)
        .populate('comments.user', 'username profilePicture');
    res.json(updatedSneaker.comments);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.markAsSold = async (req, res) => {
    try {
        const sneaker = await Sneaker.findById(req.params.id);
        if (!sneaker) return res.status(404).json({ message: "Sneaker not found" });
        if (sneaker.seller.toString() !== req.user.id) {
            return res.status(401).json({ message: "Not authorized" });
        }
        sneaker.status = 'Sold';
        await sneaker.save();
        res.json({ message: "Sneaker marked as sold", sneaker });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

exports.getSoldSneakers = async (req, res) => {
    try {
        // Find ALL sold sneakers (Global History)
        const sneakers = await Sneaker.find({ status: 'Sold' })
            .populate('seller', 'username sellerScore profilePicture')
            .sort({ createdAt: -1 });
        res.json(sneakers);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};