// src/repositories/customerRepository.js
const db = require('../config/database');
// HAPUS: const { v4: uuidv4 } = require('uuid'); <--- HILANGKAN BARIS INI

const CustomerRepository = {
    // 1. Ambil Semua Data (Search, Filter, Sort, Pagination)
    findAll: async (params) => {
        const { search, status, sortBy, sortOrder, page, perPage } = params;
        const offset = (page - 1) * perPage;

        let conditions = [];
        let values = [];

        if (search) {
            conditions.push('(name LIKE ? OR customer_code LIKE ?)');
            values.push(`%${search}%`, `%${search}%`);
        }

        if (status) {
            conditions.push('status = ?');
            values.push(status);
        }

        let whereClause = '';
        if (conditions.length > 0) {
            whereClause = 'WHERE ' + conditions.join(' AND ');
        }

        const validSort = ['name', 'created_at', 'avg_data_usage', 'join_date'];
        const sortColumn = validSort.includes(sortBy) ? sortBy : 'created_at';
        const order = sortOrder && sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const queryParams = [...values, parseInt(perPage), parseInt(offset)];
        const query = `
            SELECT * FROM customers 
            ${whereClause} 
            ORDER BY ${sortColumn} ${order} 
            LIMIT ? OFFSET ?
        `;

        const [rows] = await db.query(query, queryParams);

        const countQuery = `SELECT COUNT(*) as total FROM customers ${whereClause}`;
        const [countResult] = await db.query(countQuery, values);
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

    // 2. Cari Satu Data by ID
    findById: async (id) => {
        const query = 'SELECT * FROM customers WHERE id = ?';
        const [rows] = await db.query(query, [id]);
        return rows[0];
    },

    // 3. Tambah Data Baru (FIXED UUID IMPORT)
    create: async (data) => {
        // PERBAIKAN: Dynamic Import UUID
        const { v4: uuidv4 } = await import('uuid'); 
        const id = uuidv4();
        
        const query = `
            INSERT INTO customers (
                id, customer_code, name, age, gender, location, occupation, 
                current_plan, status, clv_segment, join_date, 
                avg_data_usage, avg_call_duration, avg_sms_count,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        await db.query(query, [
            id, data.customer_code, data.name, data.age, data.gender,
            data.location, data.occupation, data.current_plan,
            data.status || 'active', data.clv_segment || 'medium_value', 
            data.join_date || new Date(),
            data.avg_data_usage || 0, data.avg_call_duration || 0, data.avg_sms_count || 0
        ]);

        return await CustomerRepository.findById(id);
    },

    // 4. Update Data
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

        const query = `UPDATE customers SET ${fields.join(', ')} WHERE id = ?`;
        
        await db.query(query, values);
        return await CustomerRepository.findById(id);
    },

    // 5. Hapus Data
    delete: async (id) => {
        await db.query('DELETE FROM customers WHERE id = ?', [id]);
        return true;
    },

    // 6. Get Statistics
    getStats: async () => {
        const queryGeneral = `
            SELECT 
                COUNT(*) as total_customers,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_customers,
                SUM(CASE WHEN status = 'churned' THEN 1 ELSE 0 END) as churned_customers,
                AVG(TIMESTAMPDIFF(MONTH, join_date, NOW())) as avg_tenure_months
            FROM customers
        `;
        const [generalStats] = await db.query(queryGeneral);

        const querySegments = `
            SELECT clv_segment, COUNT(*) as count 
            FROM customers 
            GROUP BY clv_segment
        `;
        const [segmentStats] = await db.query(querySegments);

        return {
            general: generalStats[0],
            segments: segmentStats
        };
    }
};

module.exports = CustomerRepository;