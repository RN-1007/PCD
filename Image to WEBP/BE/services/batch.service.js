const archiver = require('archiver');
const BatchModel = require('../models/batch.model');

class BatchService {
    static getBatches() {
        return BatchModel.getAll();
    }

    static saveBatch(data) {
        // Validasi simpel
        if (!data.name || !data.fileCount) {
            throw new Error('Name and fileCount are required');
        }
        return BatchModel.create(data);
    }

    static deleteBatch(id) {
        return BatchModel.delete(id);
    }

    static async generateZip(files, res) {
        return new Promise((resolve, reject) => {
            // Setup respons header
            res.attachment(`kompresin-batch-${Date.now()}.zip`);
            
            // Inisialisasi archiver
            const archive = archiver('zip', {
                zlib: { level: 9 } // Kompresi maksimum
            });

            archive.on('error', (err) => {
                reject(err);
            });

            archive.on('end', () => {
                resolve();
            });

            // Pipe stream archiver langsung ke response
            archive.pipe(res);

            // Tambahkan setiap file dari memori ke dalam zip
            files.forEach(file => {
                archive.append(file.buffer, { name: file.originalname });
            });

            // Finalize zip
            archive.finalize();
        });
    }
}

module.exports = BatchService;
