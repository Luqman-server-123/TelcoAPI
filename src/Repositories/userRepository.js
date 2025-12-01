// src/repositories/userRepository.js
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const UserRepository = {
    // 1. Search & Paginate
    searchAndPaginate: async (search, role, page = 1, perPage = 10) => {
        const offset = (page - 1) * perPage;
        
        let conditions = [];
        let params = [];

        if (search) {
            conditions.push('(name LIKE ? OR email LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        if (role) {
            conditions.push('role = ?');
            params.push(role);
        }

        let whereClause = '';
        if (conditions.length > 0) {
            whereClause = 'WHERE ' + conditions.join(' AND ');
        }

        const queryParams = [...params, parseInt(perPage), parseInt(offset)];
        const sqlData = `SELECT * FROM users ${whereClause} LIMIT ? OFFSET ?`;
        
        // PENTING: Langsung db.query karena config kamu sudah pool.promise()
        const [rows] = await db.query(sqlData, queryParams);

        const sqlCount = `SELECT COUNT(*) as total FROM users ${whereClause}`;
        const [countResult] = await db.query(sqlCount, params);
        const total = countResult[0].total;

        return {
            data: rows,
            meta: {
                page: parseInt(page),
                per_page: parseInt(perPage),
                total: total,
                total_pages: Math.ceil(total / perPage)
            }
        };
    },

    // 2. Create User
    create: async (data) => {
        const id = uuidv4(); 
        const query = `
            INSERT INTO users (id, name, email, password, role, status, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;
        const role = data.role || 'staff'; 
        const status = data.status || 'active';

        await db.query(query, [
            id, data.name, data.email, data.password, role, status
        ]);
        
        // Panggil fungsi findById di bawah
        return await UserRepository.findById(id);
    },

    // 3. Find By ID (Namanya WAJIB findById, bukan find)
    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    },

    // 4. Find By Email
    findByEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },

    // 5. Update User
    update: async (id, data) => {
        const fields = [];
        const values = [];

        Object.keys(data).forEach(key => {
            if (key !== 'id' && key !== 'created_at') {
                fields.push(`${key} = ?`);
                values.push(data[key]);
            }
        });
        
        fields.push('updated_at = NOW()');
        if (fields.length === 0) return null;
        values.push(id); 

        const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
        
        await db.query(query, values);

        return await UserRepository.findById(id);
    },

    // 6. Delete User
    delete: async (id) => {
        await db.query('DELETE FROM users WHERE id = ?', [id]);
        return true;
    }
};

module.exports = UserRepository;