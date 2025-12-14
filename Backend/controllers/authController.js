const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER
exports.register = async (req, res) => {
  try {
    const { 
        username, password, fullname, phoneNumber, 
        country, state, city, address, postalCode 
    } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "Username already taken" });

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User (Default role will be 'user' from Schema)
    const newUser = new User({
      username,
      password: hashedPassword,
      fullname,
      phoneNumber,
      country, state, city, address, postalCode,
      sellerScore: 0 // Initialize score
    });

    await newUser.save();
    
    // Optional: Return token on register so they are logged in immediately
    // If you prefer they login manually after registering, keep it as is.
    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (!user) return res.status(404).json({ message: "User not found" });

    // Validate Password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: "Invalid credentials" });

    // Generate Token
    const token = jwt.sign(
      { 
          // Payload: Data inside the token
          user: { 
              id: user._id, 
              role: user.role,
              fullname: user.fullname,
              sellerScore: user.sellerScore
          } 
      }, 
      process.env.JWT_SECRET || 'secretKey', 
      { expiresIn: '2h' } // <--- SECURITY UPDATE: 2 HOURS ONLY
    );

    res.json({ 
        token, 
        user: { 
            username: user.username, 
            role: user.role, 
            score: user.sellerScore,
            fullname: user.fullname
        } 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};