const User = require('../models/User');

// --- GET USER PROFILE ---
exports.getUserProfile = async (req, res) => {
  try {
    // req.user.id comes from the verifyToken middleware
    const user = await User.findById(req.user.id).select('-password'); // Exclude password
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    // req.body now only contains text fields because Multer separates the file
    const { fullname, phoneNumber, country, state, city, address, postalCode } = req.body;
    
    let updateData = { 
      fullname, phoneNumber, country, state, city, address, postalCode 
    };

    // If a file was uploaded (req.file exists), we update the profilePicture path
    if (req.file) {
      // The path to the image is now the public URL the frontend can access
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