const crypto = require('crypto');

// In-memory database array (untuk contoh simulasi)
let batches = [];

class BatchModel {
    static getAll() {
        return batches;
    }

    static create(data) {
        const newBatch = {
            id: `batch-${crypto.randomUUID()}`,
            name: data.name,
            fileCount: data.fileCount,
            savedSize: data.savedSize,
            createdAt: new Date().toISOString()
        };
        // Masukkan batch baru di awal array
        batches.unshift(newBatch);
        return newBatch;
    }

    static delete(id) {
        const initialLength = batches.length;
        batches = batches.filter(b => b.id !== id);
        return batches.length < initialLength;
    }
}

module.exports = BatchModel;
