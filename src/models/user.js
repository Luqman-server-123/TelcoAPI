const db = require('../config/database');
const { v4: uuidv4 } = require('uuid'); 

const User = {
    // 1. Buat User Baru
    create: async (data) => {
        // Generate UUID sebelum insert ke DB
        const id = uuidv4(); 

        const query = `
            INSERT INTO users (id, name, email, password, role, status, last_login, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;
        
        [cite_start]// Default values (Sesuai PDF role default biasanya 'staff') [cite: 945]
        const role = data.role || 'staff'; 
        const status = data.status || 'active';
        const last_login = data.last_login || null;

        // Eksekusi Query
        const [result] = await db.query(query, [
            id, // Masukkan ID di urutan pertama
            data.name, 
            data.email, 
            data.password, 
            role, 
            status, 
            last_login
        ]);
        
        // PENTING: Kalau pakai UUID, result.insertId itu 0. 
        // Jadi kita return variable 'id' yang kita generate di atas.
        return id; 
    },

    // 2. Cari berdasarkan Email
    findByEmail: async (email) => {
        const query = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await db.query(query, [email]);
        return rows[0];
    },

    // 3. Cari berdasarkan ID
    findById: async (id) => {
        const query = 'SELECT * FROM users WHERE id = ?';
        const [rows] = await db.query(query, [id]);
        return rows[0];
    },

    // 4. Update Last Login
    updateLastLogin: async (id) => {
        // Syntax ini aman buat UUID juga
        const query = 'UPDATE users SET last_login = NOW() WHERE id = ?';
        await db.query(query, [id]);
    }
};

module.exports = User;