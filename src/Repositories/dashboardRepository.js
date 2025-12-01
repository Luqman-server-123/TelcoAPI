const db = require('../config/database');

const DashboardRepository = {
    // 1. Hitung Overview (Total User, Total Rekomendasi, dll)
    getOverviewStats: async (startDate, endDate) => {
        // Hitung Customer
        const [custStats] = await db.query(`
            SELECT 
                COUNT(*) as total_customers,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'churned' THEN 1 ELSE 0 END) as churned
            FROM customers
        `);

        // Hitung Rekomendasi (Filter tanggal kalau ada)
        let recQuery = `SELECT COUNT(*) as total_recs FROM recommendations`;
        let recParams = [];

        if (startDate && endDate) {
            recQuery += ` WHERE created_at BETWEEN ? AND ?`;
            recParams.push(startDate, endDate);
        }
        const [recStats] = await db.query(recQuery, recParams);

        // Hitung Rata-rata Confidence Score
        const [scoreStats] = await db.query(`
            SELECT AVG(confidence_score) as avg_score 
            FROM recommendation_items
        `);

        return {
            customers: custStats[0],
            recommendations: recStats[0],
            avg_score: scoreStats[0].avg_score || 0
        };
    },

    // 2. Hitung Performa Produk (Top Recommended)
    getProductPerformance: async (limit = 5) => {
        const query = `
            SELECT 
                p.id as product_id,
                p.name as product_name,
                p.category,
                p.price,
                COUNT(ri.id) as times_recommended,
                AVG(ri.confidence_score) as avg_confidence
            FROM products p
            JOIN recommendation_items ri ON p.id = ri.product_id
            GROUP BY p.id
            ORDER BY times_recommended DESC
            LIMIT ?
        `;
        const [rows] = await db.query(query, [parseInt(limit)]);
        return rows;
    }
    
};

module.exports = DashboardRepository;