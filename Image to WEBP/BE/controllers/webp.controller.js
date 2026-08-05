const fs = require('fs');
const webpService = require('../services/webp.service');

const convertToWebp = async (req, res) => {
    try {
        const files = req.files;
        const asZip = req.body.asZip === 'true';

        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'Tidak ada file yang diunggah' });
        }

        const imagesToProcess = webpService.extractImagesFromFiles(files);

        if (imagesToProcess.length === 0) {
            return res.status(400).json({ error: 'Tidak ditemukan gambar yang valid' });
        }

        const convertedImages = await webpService.convertImagesToWebp(imagesToProcess);

        if (convertedImages.length === 1 && !asZip) {
            res.setHeader('Content-Type', 'image/webp');
            res.setHeader('Content-Disposition', `attachment; filename="${convertedImages[0].name}"`);
            return res.send(convertedImages[0].data);
        } else {
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', 'attachment; filename="converted_images.zip"');

            await webpService.createZipStream(convertedImages, res);
        }

    } catch (error) {
        console.error('Controller Error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada internal server' });
    } finally {
        if (req.files) {
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            });
        }
    }
};

module.exports = {
    convertToWebp
};
