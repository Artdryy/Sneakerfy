/**
 * @swagger
 * tags:
 *   - name: Sneakers
 *     description: Sneaker management
 *
 * components:
 *   schemas:
 *     Sneaker:
 *       type: object
 *       required:
 *         - brand
 *         - model
 *         - size
 *         - price
 *         - condition
 *       properties:
 *         brand:
 *           type: string
 *         model:
 *           type: string
 *         size:
 *           type: number
 *         price:
 *           type: number
 *         condition:
 *           type: string
 *           enum: ['New', 'Used - Like New', 'Used - Good', 'Used - Fair']
 *         description:
 *           type: string
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             format: binary
 *         status:
 *           type: string
 *           enum: ['Available', 'Sold', 'Pending']
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
// Ensure this import matches the file name EXACTLY (case-sensitive)
const { createSneaker, getAllSneakers, getSneakerById, deleteSneaker, addComment, markAsSold, getSoldSneakers } = require('../controllers/SneakerController');
const { verifyToken } = require('../middleware/authMiddleware');

// --- MULTER CONFIGURATION FOR SNEAKERS ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure Backend/src/sneakerpic exists
    cb(null, 'src/sneakerpic/');
  },
  filename: function (req, file, cb) {
    cb(null, 'sneaker_' + Date.now() + '_' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

/**
 * @swagger
 * /api/sneakers:
 *   get:
 *     summary: Get all available sneakers
 *     tags: [Sneakers]
 *     responses:
 *       200:
 *         description: List of sneakers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sneaker'
 */
router.get('/', getAllSneakers);

/**
 * @swagger
 * /api/sneakers/sold:
 *    get:
 *    summary: Get sold sneakers for current user
 *    tags: [Sneakers]
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: List of sold sneakers
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Sneaker'
 */
// CRITICAL: This MUST be defined BEFORE /:id
router.get('/sold', verifyToken, getSoldSneakers); 

/**
 * @swagger
 * /api/sneakers/{id}:
 *   get:
 *     summary: Get sneaker details
 *     tags: [Sneakers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sneaker details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sneaker'
 *       404:
 *         description: Sneaker not found
 */
router.get('/:id', getSneakerById);

/**
 * @swagger
 * /api/sneakers:
 *   post:
 *     summary: List a new sneaker
 *     tags: [Sneakers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               brand:
 *                 type: string
 *               model:
 *                 type: string
 *               size:
 *                 type: number
 *               price:
 *                 type: number
 *               condition:
 *                 type: string
 *                 enum: ['New', 'Used - Like New', 'Used - Good', 'Used - Fair']
 *               description:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Sneaker created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sneaker'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
// Allow up to 5 images
router.post('/', verifyToken, upload.array('images', 5), createSneaker);

/**
 * @swagger
 * /api/sneakers/{id}:
 *   delete:
 *     summary: Delete a sneaker listing
 *     tags: [Sneakers]
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
 *         description: Sneaker deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Sneaker not found
 */
router.delete('/:id', verifyToken, deleteSneaker);

/**
 * @swagger
 * /api/sneakers/{id}/comments:
 *    post:
 *      summary: Add a comment to a sneaker
 *      tags: [Sneakers]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                text:
 *                  type: string
 *              required:
 *                - text
 *      responses:
 *        200:
 *          description: Comment added
 *        404:
 *          description: Sneaker not found
 */
router.post('/:id/comments', verifyToken, addComment);

/**
 * @swagger
 * /api/sneakers/{id}/sold:
 *    put:
 *    summary: Mark a sneaker as sold
 *    tags: [Sneakers]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: Sneaker marked as sold
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: Sneaker not found
 */
router.put('/:id/sold', verifyToken, markAsSold);

module.exports = router;