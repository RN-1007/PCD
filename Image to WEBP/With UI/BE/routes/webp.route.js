const express = require('express');
const multer = require('multer');
const { convertToWebp } = require('../controllers/webp.controller');

const router = express.Router();
// Konfigurasi folder temporary untuk upload file
const upload = multer({ dest: 'uploads/' });

// POST endpoint: /api/convert-webp
/**
 * @swagger
 * /api/convert-webp:
 *   post:
 *     summary: Mengonversi gambar ke WEBP (Lossless)
 *     description: |
 *       Mengonversi satu atau banyak file gambar (atau ZIP) menjadi WEBP.
 *       
 *       ### 💡 Contoh Payload & Fetch API (Untuk Frontend)
 *       API ini menggunakan `multipart/form-data`. Berikut cara *fetching*-nya:
 *       
 *       ```javascript
 *       const formData = new FormData();
 *       
 *       // 1. Masukkan file ke form data (bisa dari input HTML)
 *       // Jika upload banyak file, gunakan loop untuk append dengan key 'files'
 *       for (let file of fileInput.files) {
 *           formData.append('files', file); 
 *       }
 *       
 *       // 2. (Opsional) Tambahkan opsi output ZIP jika perlu
 *       formData.append('asZip', 'true');
 *       
 *       // 3. Tembak API
 *       const response = await fetch('http://localhost:3001/api/convert-webp', {
 *           method: 'POST',
 *           body: formData // Browser akan otomatis mengatur boundary header
 *       });
 *       
 *       // 4. Download file hasil konversi
 *       const blob = await response.blob();
 *       // ... (Logika auto-download)
 *       ```
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
 *                 description: |
 *                   File gambar atau file `.zip`. Kamu bisa mengirim lebih dari satu file dengan menggunakan *key* `files` berkali-kali.
 *               asZip:
 *                 type: string
 *                 enum: ["true", "false"]
 *                 example: "true"
 *                 description: Set "true" jika ingin memaksa hasil gambar dibungkus `.zip`.
 *     responses:
 *       200:
 *         description: Berhasil mengonversi gambar.
 *         content:
 *           image/webp:
 *             schema:
 *               type: string
 *               format: binary
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Tidak ada file atau gambar yang valid.
 *       500:
 *         description: Kesalahan internal server.
 */
router.post('/convert-webp', upload.array('files'), convertToWebp);

module.exports = router;
