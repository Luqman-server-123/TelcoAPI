const db = require('../config/database');

const Customer = {
    // 1. Ambil Semua Data (Filter & Pagination)
    findAll: async (conditions = [], params = [], limit, offset) => {
        let sql = 'SELECT * FROM customers';
        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        sql += ' ORDER BY created_at DESC'; // Laravel: latest()

        if (limit) {
            sql += ' LIMIT ? OFFSET ?';
            params.push(parseInt(limit), parseInt(offset));
        }

        const [rows] = await db.query(sql, params);
        return rows;
    },

    // 2. Hitung Total (Buat Pagination)
    countAll: async (conditions = [], params = []) => {
        let sql = 'SELECT COUNT(*) as total FROM customers';
        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        const [rows] = await db.query(sql, params);
        return rows[0].total;
    },

    // 3. Find By ID
    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM customers WHERE id = ?', [id]);
        return rows[0];
    },

    // 4. Create (LENGKAP SESUAI SCREENSHOT FILLABLE)
    create: async (data) => {
        const query = `
            INSERT INTO customers (
                name, phone_number, age, gender, location, occupation, status, join_date, 
                clv_segment, avg_call_duration, avg_data_usage_gb, plan_type, sms_freq,
                device_brand, monthly_spend, pct_video_usage, complaint_count, 
                topup_freq, travel_score, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;
        
        // Mapping data (pakai default value null biar gak error kalau kosong)
        const params = [
            data.name, data.phone_number || null, data.age || null, data.gender || null, 
            data.location || null, data.occupation || null, data.status || 'active', 
            data.join_date || null, data.clv_segment || null, data.avg_call_duration || 0,
            data.avg_data_usage_gb || 0, data.plan_type || null, data.sms_freq || 0,
            data.device_brand || null, data.monthly_spend || 0, data.pct_video_usage || 0,
            data.complaint_count || 0, data.topup_freq || 0, data.travel_score || 0
        ];
        
        const [result] = await db.query(query, params);
        return result.insertId;
    },

    // 5. Update (LENGKAP)
    update: async (id, data) => {
        // Kita update field updated_at otomatis
        const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = Object.values(data);
        
        if (fields.length === 0) return false;

        const query = `UPDATE customers SET ${fields}, updated_at = NOW() WHERE id = ?`;
        await db.query(query, [...values, id]);
        
        return true;
    },

    // 6. Delete
    delete: async (id) => {
        await db.query('DELETE FROM customers WHERE id = ?', [id]);
    }
};

module.exports = Customer;