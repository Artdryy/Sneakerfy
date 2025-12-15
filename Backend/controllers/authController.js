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
  // ALWAYS Log the code to console for development/testing
  console.log(`[VERIFICATION CODE] To: ${email} | Code: ${code}`);

  try {
    // Only attempt to send if credentials exist, otherwise skip to avoid timeout/errors
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await transporter.sendMail({
          from: '"Sneakerfy" <no-reply@sneakerfy.com>',
          to: email, 
          subject: "Your Verification Code",
          text: `Your code is: ${code}`,
          html: `<b>Your code is: ${code}</b>`
        });
        console.log(`[EMAIL SENT] Successfully sent to ${email}`);
    } else {
        console.log(`[EMAIL SKIPPED] Missing env variables. Using console log only.`);
    }
  } catch (error) {
    console.error("Email sending failed (Code is still valid in console):", error.message);
    // We do NOT throw here, so the registration flow completes even if email fails.
  }
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const { 
        username, email, password, fullname, phoneNumber, 
        country, state, city, address, postalCode 
    } = req.body;

    // Check if username OR email exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) return res.status(400).json({ message: "Username or Email already taken" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate Code
    const code = crypto.randomInt(100000, 999999).toString();
    const expiration = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const newUser = new User({
      username,
      email, 
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
    
    // Send Email (or log it)
    await sendVerificationEmail(email, code);

    res.status(201).json({ message: "User registered. Please check your email (or console) for the verification code." });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// VERIFY EMAIL
exports.verifyEmail = async (req, res) => {
  try {
    const { username, code } = req.body;
    
    // Find user by username AND code AND valid expiration
    const user = await User.findOne({ 
      username,
      verificationCode: code,
      verificationCodeExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    // Mark as verified and clear the code
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

    // Enable verification check
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

    // Set a secure cookie for cross-site usage (SameSite=None requires Secure)
    // Use the __Secure- prefix per cookie prefix rules - requires Secure flag
    try {
      res.cookie('__Secure-YEC', token, {
        httpOnly: true,
        secure: true, // ensure HTTPS in production; Chrome allows secure on localhost
        sameSite: 'None',
        maxAge: 2 * 60 * 60 * 1000 // 2 hours
      });
    } catch (err) {
      // Don't block login if cookie can't be set (e.g., insecure env)
      console.warn('Could not set auth cookie:', err.message);
    }

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

    // Use shared email function
    await sendVerificationEmail(user.email, code);
    
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