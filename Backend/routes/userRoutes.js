/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User profile and management
 *
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - fullname
 *       properties:
 *         username:
 *           type: string
 *         fullname:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         country:
 *           type: string
 *         state:
 *           type: string
 *         city:
 *           type: string
 *         address:
 *           type: string
 *         postalCode:
 *           type: string
 *         profilePicture:
 *           type: string
 *           description: URL to the profile image
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { updateProfile, getUserProfile, rateUser, banUser, getAllUsers, getTopSellers } = require('../controllers/userController'); // Import rateUser
const { verifyToken } = require('../middleware/authMiddleware');

// --- MULTER CONFIGURATION ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/profilepic/');
  },
  filename: function (req, file, cb) {
    cb(null, 'profile_' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

/**
 * @swagger
 * /api/users/top-sellers:
 *   get:
 *     summary: Get top 5 sellers by score
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of top sellers
 */
// Public or Protected? Let's make it protected to be safe, or public if needed for landing page.
// Assuming protected for now based on app structure.
router.get('/top-sellers', verifyToken, getTopSellers);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current authenticated user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', verifyToken, getUserProfile);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Forbidden
 */
// FIX: Added missing route for Admin Page
router.get('/', verifyToken, getAllUsers);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update authenticated user's profile and picture
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
 *               phoneNumber:
 *                 type: string
 *               country:
 *                 type: string
 *               state:
 *                 type: string
 *               city:
 *                 type: string
 *               address:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/profile', verifyToken, upload.single('profilePicture'), updateProfile);

/**
 * @swagger
 * /api/users/rate:
 *   post:
 *     summary: Rate another user (1-5 stars)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetUserId
 *               - score
 *             properties:
 *               targetUserId:
 *                 type: string
 *                 description: ID of the user being rated
 *               score:
 *                 type: number
 *                 description: Rating from 1 to 5
 *     responses:
 *       200:
 *         description: Rating added successfully
 *       400:
 *         description: Invalid score or duplicate rating
 *       404:
 *         description: User not found
 */
router.post('/rate', verifyToken, rateUser);

/**
 * @swagger
 * /api/users/{id}/ban:
 *   put:
 *     summary: Ban/Unban a user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User ban status updated
 *       403:
 *         description: Forbidden
 */
router.put('/:id/ban', verifyToken, banUser);

module.exports = router;