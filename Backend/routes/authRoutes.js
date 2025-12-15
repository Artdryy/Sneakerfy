const express = require('express');
const router = express.Router();
const { register, login, verifyEmail } = require('../controllers/authController');

/**
 * @swagger
 * components:
 * schemas:
 * User:
 * type: object
 * required:
 * - username
 * - password
 * - fullname
 * properties:
 * username:
 * type: string
 * description: The user's unique username
 * password:
 * type: string
 * description: The user's password
 * fullname:
 * type: string
 * description: The user's full name
 * country:
 * type: string
 * description: User's country
 */

/**
 * @swagger
 * /api/auth/register:
 * post:
 * summary: Register a new user
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - username
 * - password
 * - fullname
 * properties:
 * username:
 * type: string
 * password:
 * type: string
 * fullname:
 * type: string
 * phoneNumber:
 * type: string
 * country:
 * type: string
 * state:
 * type: string
 * city:
 * type: string
 * address:
 * type: string
 * postalCode:
 * type: string
 * responses:
 * 201:
 * description: User created successfully
 * 400:
 * description: Username already taken
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 * post:
 * summary: Login and get a JWT token
 * tags: [Auth]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - username
 * - password
 * properties:
 * username:
 * type: string
 * password:
 * type: string
 * responses:
 * 200:
 * description: Login successful
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * token:
 * type: string
 * user:
 * type: object
 * 400:
 * description: Invalid credentials
 */
router.post('/login', login);


/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify account with code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verified successfully
 *       400:
 *         description: Invalid code
 */
router.post('/verify-email', verifyEmail);

module.exports = router;