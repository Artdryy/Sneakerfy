const express = require('express');
const router = express.Router();
const { sendMessage, getConversation } = require('../controllers/messageController');
const { verifyToken } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Messages
 *     description: User messaging
 */

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send a message to another user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientId
 *               - content
 *             properties:
 *               recipientId:
 *                 type: string
 *               content:
 *                 type: string
 *               sneakerId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent
 */
router.post('/', verifyToken, sendMessage);

/**
 * @swagger
 * /api/messages/{otherUserId}:
 *   get:
 *     summary: Get conversation with a specific user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: otherUserId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of messages
 */
router.get('/:otherUserId', verifyToken, getConversation);

/**
 * @swagger
 * /api/messages/{otherUserId}:
 *   get:
 *     summary: Get conversation with a specific user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: otherUserId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of messages
 */

router.get('/:otherUserId', verifyToken, getConversation);

module.exports = router;