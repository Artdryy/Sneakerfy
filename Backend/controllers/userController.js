const User = require('../models/User');

// --- GET USER PROFILE ---
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// --- UPDATE USER PROFILE ---
exports.updateProfile = async (req, res) => {
  try {
    const { fullname, phoneNumber, country, state, city, address, postalCode } = req.body;
    let updateData = { fullname, phoneNumber, country, state, city, address, postalCode };

    if (req.file) {
      updateData.profilePicture = `http://localhost:5000/profilepic/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// --- RATE USER ---
exports.rateUser = async (req, res) => {
  try {
    const { targetUserId, score } = req.body;
    const raterId = req.user.id;

    if (score < 1 || score > 5) return res.status(400).json({ message: "Score must be 1-5" });
    if (targetUserId === raterId) return res.status(400).json({ message: "Cannot rate yourself" });

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    const existingRatingIndex = targetUser.ratings.findIndex(r => r.userId.toString() === raterId);
    if (existingRatingIndex !== -1) return res.status(400).json({ message: "Already rated" });

    targetUser.ratings.push({ userId: raterId, score });
    const totalScore = targetUser.ratings.reduce((sum, r) => sum + r.score, 0);
    targetUser.sellerScore = parseFloat((totalScore / targetUser.ratings.length).toFixed(1));

    await targetUser.save();
    res.json({ message: "Rating added", newScore: targetUser.sellerScore });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// --- GET ALL USERS (Admin Only) ---
exports.getAllUsers = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied" });
        }
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// --- BAN USER (Admin Only) ---
exports.banUser = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied" });
        }
        
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.isBanned = !user.isBanned;
        await user.save();

        res.json({ message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`, isBanned: user.isBanned });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// --- GET TOP SELLERS ---
exports.getTopSellers = async (req, res) => {
    try {
        // Find top 5 users sorted by sellerScore descending
        const topSellers = await User.find({ role: { $ne: 'admin' } }) // Exclude admins
            .sort({ sellerScore: -1 })
            .limit(5)
            .select('username fullname sellerScore profilePicture');
        
        res.json(topSellers);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};