const User = require('../models/User');

// --- GET USER PROFILE ---
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// --- UPDATE USER PROFILE ---
exports.updateProfile = async (req, res) => {
  try {
    const { fullname, phoneNumber, country, state, city, address, postalCode } = req.body;
    
    let updateData = { 
      fullname, phoneNumber, country, state, city, address, postalCode 
    };

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
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// --- RATE USER ---
exports.rateUser = async (req, res) => {
  try {
    const { targetUserId, score } = req.body;
    const raterId = req.user.id;

    if (score < 1 || score > 5) {
      return res.status(400).json({ message: "Score must be between 1 and 5" });
    }

    if (targetUserId === raterId) {
      return res.status(400).json({ message: "You cannot rate yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "User to rate not found" });
    }

    // Check if user already rated
    const existingRatingIndex = targetUser.ratings.findIndex(
      (rating) => rating.userId.toString() === raterId
    );

    if (existingRatingIndex !== -1) {
      return res.status(400).json({ message: "You have already rated this user" });
    }

    // Add new rating
    targetUser.ratings.push({ userId: raterId, score });

    // Calculate new average
    const totalScore = targetUser.ratings.reduce((sum, r) => sum + r.score, 0);
    targetUser.sellerScore = parseFloat((totalScore / targetUser.ratings.length).toFixed(1));

    await targetUser.save();

    res.json({ message: "Rating added successfully", newScore: targetUser.sellerScore });

  } catch (error) {
    console.error("Rate User Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};