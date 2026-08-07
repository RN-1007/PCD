const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WEBP Converter API',
      version: '1.0.0',
      description: 'API untuk mengonversi gambar dan ZIP ke format WEBP secara lossless',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Local server',
      },
    ],
  },
  apis: ['./routes/*.js'], // Menunjuk ke file route untuk membaca anotasi Swagger
};

const specs = swaggerJsDoc(options);

module.exports = {
  swaggerUi,
  specs,
};
