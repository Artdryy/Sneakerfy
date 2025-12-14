/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User profile and management
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { updateProfile } = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware'); // Middleware needed

// --- MULTER CONFIGURATION ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure this directory exists! Backend/src/profilepic
    cb(null, 'src/profilepic/');
  },
  filename: function (req, file, cb) {
    // Creates a unique name: profile_17399238382.jpg
    cb(null, 'profile_' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update authenticated user's profile details and picture.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullname:
 *                 type: string
 *                 example: "Jane Doe"
 *               phoneNumber:
 *                 type: string
 *                 example: "5551234567"
 *               country:
 *                 type: string
 *                 example: "USA"
 *               state:
 *                 type: string
 *                 example: "California"
 *               city:
 *                 type: string
 *                 example: "Los Angeles"
 *               address:
 *                 type: string
 *                 example: "123 Main St"
 *               postalCode:
 *                 type: string
 *                 example: "90001"
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: New profile image file (optional)
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized, missing or invalid token.
 *       500:
 *         description: Server error.
 */
// Multer middleware (upload.single) runs BEFORE the controller to process the file.
router.put('/profile', verifyToken, upload.single('profilePicture'), updateProfile);

module.exports = router;