const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api'); // Import route yang barusan dibuat

const app = express();
const PORT = process.env.PORT || 8000; // Pastikan port aman (bukan 5000)

// --- Global Middleware ---
app.use(cors()); // Biar bisa diakses dari Frontend/Postman beda origin
app.use(express.json()); // Supaya bisa baca JSON body
app.use(express.urlencoded({ extended: true }));

// --- Base URL Endpoint ---
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to TelcoAPI',
        meta: { timestamp: new Date().toISOString(), version: '1.0' }
    });
});

// --- API Routes ---
app.use('/api/v1', apiRoutes);

// --- 404 Handler (Kalau URL ngawur) ---
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        meta: { timestamp: new Date().toISOString(), version: '1.0' }
    });
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server Express berjalan di http://localhost:${PORT} 🚀`);
});

module.exports = app;
