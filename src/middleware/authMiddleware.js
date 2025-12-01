const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
    // 1. Ambil token dari Header 'Authorization'
    // Format biasanya: "Bearer <token_panjang_acak>"
    const authHeader = req.headers['authorization'];
    
    // Kita split spasi, ambil elemen kedua (tokennya saja)
    const token = authHeader && authHeader.split(' ')[1]; 

    // Kalau tidak ada token
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Akses ditolak. Token tidak ditemukan.',
            meta: { timestamp: new Date().toISOString(), version: '1.0' }
        });
    }

    try {
        // 2. Verifikasi Token dengan Secret Key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Simpan data user (id, role) ke dalam object Request
        // Inilah kenapa di Controller nanti kita bisa pakai `req.user`
        req.user = decoded;
        
        // 4. Lanjut ke proses berikutnya (Controller)
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Token tidak valid atau sudah kadaluarsa.',
            meta: { timestamp: new Date().toISOString(), version: '1.0' }
        });
    }
};

module.exports = authMiddleware;