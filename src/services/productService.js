const ProductRepository = require("../Repositories/productRepository"); 
const db = require("../config/database");

const ProductService = {
  getAllProducts: async (query) => {
    const { search, category, min_price, max_price, sort_by, sort_order, page, limit } = query;
    return await ProductRepository.findAll({
      search, category, min_price, max_price,
      sortBy: sort_by, sortOrder: sort_order,
      page: page || 1, perPage: limit || 20
    });
  },

  getProductById: async (id) => {
    const product = await ProductRepository.findById(id);
    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }
    return product;
  },

  createProduct: async (data) => {
    if (!data.name || !data.category || !data.price) {
      const error = new Error("Name, Category, and Price are required");
      error.statusCode = 400;
      throw error;
    }

    // --- LOGIC GENERATE PROD-001 ---
    let newCode = "PROD-001"; 
    
    // Perbaikan: Hapus .promise(), langsung db.query
    const [lastProduct] = await db.query(
        "SELECT product_code FROM products WHERE product_code IS NOT NULL ORDER BY product_code DESC LIMIT 1"
    );

    if (lastProduct.length > 0) {
        const lastCode = lastProduct[0].product_code; 
        const numberPart = parseInt(lastCode.split("-")[1]); 
        const nextNumber = numberPart + 1; 
        newCode = `PROD-${String(nextNumber).padStart(3, "0")}`; 
    }
    // -------------------------------

    const newProduct = { ...data, product_code: newCode };
    return await ProductRepository.create(newProduct);
  },

  updateProduct: async (id, data) => {
    const existing = await ProductRepository.findById(id);
    if (!existing) {
        const error = new Error("Product not found");
        error.statusCode = 404;
        throw error;
    }
    return await ProductRepository.update(id, data);
  },

  deleteProduct: async (id) => {
    const existing = await ProductRepository.findById(id);
    if (!existing) {
        const error = new Error("Product not found");
        error.statusCode = 404;
        throw error;
    }
    return await ProductRepository.delete(id);
  },

  // Logic Format Data Categories
  getProductCategories: async () => {
      const stats = await ProductRepository.getCategoriesStats();
      
      const displayNames = {
          data: "Paket Data",
          voice: "Paket Telepon",
          combo: "Paket Combo",
          addon: "Add-on Services"
      };

      return stats.map(item => ({
          category: item.category,
          display_name: displayNames[item.category] || item.category,
          count: item.count,
          price_range: {
              min: item.min_price,
              max: item.max_price
          }
      }));
  }
};

module.exports = ProductService;