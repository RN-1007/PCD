const express = require('express');
const webpRoutes = require('./routes/webp.route');
const { swaggerUi, specs } = require('./swagger');

const app = express();
const PORT = process.env.PORT || 3001;

app.use('/api', webpRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Swagger UI is available at http://localhost:${PORT}/api-docs`);
});
