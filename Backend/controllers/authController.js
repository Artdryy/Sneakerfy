const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// --- EMAIL TRANSPORTER CONFIGURATION ---
const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS
  }
});

// Helper function to send email
const sendVerificationEmail = async (email, code) => {
  try {
     await transporter.sendMail({
      from: '"Sneakerfy" <no-reply@sneakerfy.com>',
      to: email, 
      subject: "Your Verification Code",
      text: `Your code is: ${code}`,
      html: `<b>Your code is: ${code}</b>`
    });
    
    console.log(`[EMAIL SIMULATION] To: ${email}, Code: ${code}`);
  } catch (error) {
    console.error("Email error:", error);
  }
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const { 
        username, email, password, fullname, phoneNumber, // Added email
        country, state, city, address, postalCode 
    } = req.body;

    // Check if username OR email exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) return res.status(400).json({ message: "Username or Email already taken" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate Code
    const code = crypto.randomInt(100000, 999999).toString();
    const expiration = new Date(Date.now() + 24 * 60 * 60 * 1000); 

    const newUser = new User({
      username,
      email, // Save email
      password: hashedPassword,
      fullname,
      phoneNumber,
      country, state, city, address, postalCode,
      sellerScore: 0,
      isVerified: false,
      verificationCode: code,
      verificationCodeExpires: expiration
    });

    await newUser.save();
    
    // Send Email to the REAL email address now
    await sendVerificationEmail(email, code);

    res.status(201).json({ message: "User registered. Please check your email for the verification code." });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// VERIFY EMAIL
exports.verifyEmail = async (req, res) => {
  try {
    const { username, code } = req.body;
    
    // Find user by username
    const user = await User.findOne({ 
      username,
      verificationCode: code,
      verificationCodeExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.json({ message: "Account verified successfully! You can now login." });

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

    if (!user.isVerified) {
        return res.status(403).json({ message: "Please verify your account first." });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { 
          user: { 
              id: user._id, 
              role: user.role,
              fullname: user.fullname,
              sellerScore: user.sellerScore
          } 
      }, 
      process.env.JWT_SECRET || 'secretKey', 
      { expiresIn: '2h' }
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

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ message: "User not found" });

    const code = crypto.randomInt(100000, 999999).toString();
    user.verificationCode = code;
    user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send code to user's registered email
    console.log(`[SIMULATION] Reset Code for ${username} (${user.email}): ${code}`);
    res.json({ message: "Reset code sent" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { username, code, newPassword } = req.body;
    const user = await User.findOne({ 
      username,
      verificationCode: code,
      verificationCodeExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Invalid code" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};