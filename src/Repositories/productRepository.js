const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const ProductRepository = {
    // 1. Get All (Search, Category, Price Range, Sort)
    findAll: async (params) => {
        const { search, category, min_price, max_price, sortBy, sortOrder, page, perPage } = params;
        const offset = (page - 1) * perPage;

        let conditions = [];
        let values = [];

        if (search) {
            conditions.push('(name LIKE ? OR product_code LIKE ?)');
            values.push(`%${search}%`, `%${search}%`);
        }
        if (category) {
            conditions.push('category = ?');
            values.push(category);
        }
        // Filter Price Range (Sesuai PDF)
        if (min_price) {
            conditions.push('price >= ?');
            values.push(min_price);
        }
        if (max_price) {
            conditions.push('price <= ?');
            values.push(max_price);
        }

        let whereClause = '';
        if (conditions.length > 0) {
            whereClause = 'WHERE ' + conditions.join(' AND ');
        }

        const validSort = ['name', 'price', 'created_at', 'validity_days'];
        const sortColumn = validSort.includes(sortBy) ? sortBy : 'created_at';
        const order = sortOrder && sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const queryParams = [...values, parseInt(perPage), parseInt(offset)];
        const query = `
            SELECT * FROM products 
            ${whereClause} 
            ORDER BY ${sortColumn} ${order} 
            LIMIT ? OFFSET ?
        `;

        const [rows] = await db.query(query, queryParams);

        const countQuery = `SELECT COUNT(*) as total FROM products ${whereClause}`;
        const [countResult] = await db.query(countQuery, values);
        
        return {
            data: rows,
            meta: {
                page: parseInt(page),
                per_page: parseInt(perPage),
                total: countResult[0].total,
                total_pages: Math.ceil(countResult[0].total / perPage)
            }
        };
    },

    // 2. Find By ID
    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
        return rows[0];
    },

    // 3. Create
    create: async (data) => {
        const id = uuidv4();
        const query = `
            INSERT INTO products (
                id, product_code, name, category, price, description,
                data_quota, call_minutes, sms_count, validity_days, is_active,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;
        
        await db.query(query, [
            id, data.product_code, data.name, data.category, data.price, data.description,
            data.data_quota, data.call_minutes, data.sms_count, data.validity_days, 
            data.is_active !== undefined ? data.is_active : true
        ]);

        return await ProductRepository.findById(id);
    },

    // 4. Update
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

        const query = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
        await db.query(query, values);

        return await ProductRepository.findById(id);
    },

    // 5. Delete
    delete: async (id) => {
        await db.query('DELETE FROM products WHERE id = ?', [id]);
        return true;
    },

    // 6. Get Categories Stats (Untuk Endpoint 18)
    getCategoriesStats: async () => {
        const query = `
            SELECT 
                category, 
                COUNT(*) as count, 
                MIN(price) as min_price, 
                MAX(price) as max_price 
            FROM products 
            GROUP BY category
        `;
        const [rows] = await db.query(query);
        return rows;
    }
};

module.exports = ProductRepository;