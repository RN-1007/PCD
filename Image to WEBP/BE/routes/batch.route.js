const express = require('express');
const multer = require('multer');
const BatchController = require('../controllers/batch.controller');

const router = express.Router();
// Gunakan memoryStorage agar file tidak perlu disimpan di disk, melainkan diproses langsung dari buffer
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /api/download-zip:
 *   post:
 *     summary: Generate ZIP file from uploaded images
 *     tags: [Batches]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: A ZIP file
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 */
router.post('/download-zip', upload.array('files'), BatchController.downloadZip);

/**
 * @swagger
 * /api/batches:
 *   get:
 *     summary: Retrieve history batches
 *     tags: [Batches]
 *     responses:
 *       200:
 *         description: A list of batches.
 */
router.get('/batches', BatchController.getBatches);

/**
 * @swagger
 * /api/batches:
 *   post:
 *     summary: Save a batch history
 *     tags: [Batches]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               fileCount:
 *                 type: integer
 *               savedSize:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/batches', BatchController.saveBatch);

/**
 * @swagger
 * /api/batches/{id}:
 *   delete:
 *     summary: Delete a batch history by ID
 *     tags: [Batches]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The batch ID
 *     responses:
 *       200:
 *         description: Deleted successfully
 */
router.delete('/batches/:id', BatchController.deleteBatch);

module.exports = router;
