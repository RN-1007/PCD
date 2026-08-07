const BatchService = require('../services/batch.service');

class BatchController {
    static getBatches(req, res) {
        try {
            const batches = BatchService.getBatches();
            res.status(200).json(batches);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static saveBatch(req, res) {
        try {
            const batch = BatchService.saveBatch(req.body);
            res.status(201).json(batch);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static deleteBatch(req, res) {
        try {
            const { id } = req.params;
            const success = BatchService.deleteBatch(id);
            if (success) {
                res.status(200).json({ message: 'Batch deleted successfully' });
            } else {
                res.status(404).json({ message: 'Batch not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async downloadZip(req, res) {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: 'No files provided in the form data field "files"' });
            }
            await BatchService.generateZip(req.files, res);
        } catch (error) {
            // Jika headers belum terkirim, kirim JSON error
            if (!res.headersSent) {
                res.status(500).json({ error: error.message });
            } else {
                console.error('Error during ZIP generation:', error);
            }
        }
    }
}

module.exports = BatchController;
