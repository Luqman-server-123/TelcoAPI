const db = require('../config/database');
// HAPUS: const { v4: uuidv4 } = require('uuid'); <--- HILANGKAN BARIS INI

const RecommendationRepository = {
    // 1. Simpan Header (FIXED UUID IMPORT)
    createHeader: async (data) => {
        // PERBAIKAN: Dynamic Import UUID
        const { v4: uuidv4 } = await import('uuid');
        const id = uuidv4(); 
        
        const query = `
            INSERT INTO recommendations (
                id, customer_id, generated_by_user_id, status, 
                model_version, algorithm, processing_time_ms, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;
        await db.query(query, [
            id, data.customer_id, data.generated_by_user_id, 'sent',
            data.model_version, data.algorithm, data.processing_time_ms
        ]);
        return id;
    },

    // 2. Simpan Items (Bulk Insert) (FIXED UUID IMPORT)
    createItems: async (recommendationId, items) => {
        if (items.length === 0) return;

        // PERBAIKAN: Dynamic Import UUID
        const { v4: uuidv4 } = await import('uuid');
        
        const values = items.map(item => [
            uuidv4(), // Dipanggil di sini
            recommendationId, 
            item.product_id, 
            item.rank_order, 
            item.confidence_score, 
            item.reasoning
        ]);

        const query = `
            INSERT INTO recommendation_items (id, recommendation_id, product_id, rank_order, confidence_score, reasoning) 
            VALUES ?
        `;
        await db.query(query, [values]);
    },

    // 3. Get Detail Lengkap (Join Product biar ada nama & harga)
    findById: async (id) => {
        const [header] = await db.query(
            `SELECT r.*, c.name as customer_name, u.name as staff_name 
             FROM recommendations r
             JOIN customers c ON r.customer_id = c.id
             JOIN users u ON r.generated_by_user_id = u.id
             WHERE r.id = ?`, [id]
        );
        
        if (header.length === 0) return null;

        const [items] = await db.query(
            `SELECT ri.*, p.name as product_name, p.category, p.price, p.description 
             FROM recommendation_items ri
             JOIN products p ON ri.product_id = p.id
             WHERE ri.recommendation_id = ?
             ORDER BY ri.rank_order ASC`, [id]
        );

        return { ...header[0], recommendations: items };
    },
    
    // 4. Get History
    getHistory: async (customerId) => {
        let query = `
            SELECT r.*, c.name as customer_name 
            FROM recommendations r
            JOIN customers c ON r.customer_id = c.id
        `;
        const params = [];

        if (customerId) {
            query += ` WHERE r.customer_id = ?`;
            params.push(customerId);
        }

        query += ` ORDER BY r.created_at DESC LIMIT 20`;
        const [rows] = await db.query(query, params);
        return rows;
    },
    
    // 5. Override Recommendation (Update)
    override: async (id, data) => {
        const query = `
            UPDATE recommendations 
            SET is_overridden = TRUE, 
                override_product_id = ?, 
                override_reason = ?, 
                updated_at = NOW() 
            WHERE id = ?
        `;
        await db.query(query, [data.product_id, data.override_reason, id]);
        
        return await RecommendationRepository.findById(id);
    }
};

module.exports = RecommendationRepository;