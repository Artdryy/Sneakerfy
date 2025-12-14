const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const path = require('path'); // <--- 1. ADD THIS

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true })); 

// 🚨 UPDATE: Set JSON limit and handle URL encoding for form data
// We are moving to file uploads, but keeping the limit high for flexibility.
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cookieParser());

// --- 2. SERVE STATIC IMAGES ---
// Expose the folders so the frontend can display the images using a URL
// Example URL: http://localhost:5000/profilepic/somefilename.jpg
app.use('/profilepic', express.static(path.join(__dirname, 'src/profilepic')));
app.use('/sneakerpic', express.static(path.join(__dirname, 'src/sneakerpic')));


// --- SWAGGER CONFIGURATION (keep yours) ---
const swaggerOptions = {
    // ... your swaggerDefinition ...
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Sneakerfy API',
            version: '1.0.0',
            description: 'API for Sneakerfy E-commerce Application',
            contact: {
                name: 'Developer',
            },
        },
        servers: [{ url: `http://localhost:${PORT}` }],
        // 3. ADD SECURITY SCHEMA FOR AUTHENTICATION
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        },
        security: [{ bearerAuth: [] }] // Applies security globally to Swagger
    },
    apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// --- ROUTES ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes')); // <--- ADD THIS LINE BACK

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📄 Documentation available at http://localhost:${PORT}/api-docs`);
});