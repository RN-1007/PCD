const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');
const archiver = require('archiver');
const sharp = require('sharp');

const VALID_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.gif'];


const extractImagesFromFiles = (files) => {
    let images = [];

    for (const file of files) {
        const isZip = file.mimetype === 'application/zip' || file.originalname.toLowerCase().endsWith('.zip');

        if (isZip) {
            const zip = new AdmZip(file.path);
            const zipEntries = zip.getEntries();

            zipEntries.forEach(entry => {
                if (!entry.isDirectory) {
                    const ext = path.extname(entry.entryName).toLowerCase();
                    if (VALID_EXTENSIONS.includes(ext)) {
                        images.push({
                            name: path.basename(entry.entryName),
                            data: entry.getData()
                        });
                    }
                }
            });
        } else {
            const ext = path.extname(file.originalname).toLowerCase();
            if (VALID_EXTENSIONS.includes(ext)) {
                images.push({
                    name: file.originalname,
                    data: fs.readFileSync(file.path)
                });
            }
        }
    }

    return images;
};


const convertImagesToWebp = async (images) => {
    return Promise.all(images.map(async (img) => {
        const nameWithoutExt = path.parse(img.name).name;

        const webpData = await sharp(img.data)
            .webp({ lossless: true })
            .toBuffer();

        return {
            name: `${nameWithoutExt}.webp`,
            data: webpData
        };
    }));
};


const createZipStream = (images, responseStream) => {
    return new Promise((resolve, reject) => {
        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.on('error', (err) => reject(err));

        archive.pipe(responseStream);

        images.forEach(img => {
            archive.append(img.data, { name: img.name });
        });

        archive.on('end', resolve);
        archive.finalize();
    });
};

module.exports = {
    extractImagesFromFiles,
    convertImagesToWebp,
    createZipStream
};
