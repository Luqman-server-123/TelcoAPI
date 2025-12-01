const BaseController = require("../baseController");
const ProductService = require("../../services/productService");

class ProductController extends BaseController {
  
  // GET List
  async index(req, res) {
    try {
      const result = await ProductService.getAllProducts(req.query);
      return this.sendResponse(res, result, "Products retrieved successfully");
    } catch (error) {
      return this.sendError(res, error.message, [], error.statusCode || 500);
    }
  }

  // GET Categories (Endpoint 18)
  async categories(req, res) {
    try {
      const result = await ProductService.getProductCategories();
      return this.sendResponse(res, result, "Product categories retrieved successfully");
    } catch (error) {
      return this.sendError(res, error.message, [], error.statusCode || 500);
    }
  }

  // GET Detail
  async show(req, res) {
    try {
      const { id } = req.params;
      const result = await ProductService.getProductById(id);
      return this.sendResponse(res, result, "Product detail retrieved successfully");
    } catch (error) {
      return this.sendError(res, error.message, [], error.statusCode || 404);
    }
  }

  // CREATE
  async store(req, res) {
    try {
      const result = await ProductService.createProduct(req.body);
      res.status(201);
      return this.sendResponse(res, result, "Product created successfully");
    } catch (error) {
      return this.sendError(res, error.message, [], error.statusCode || 400);
    }
  }

  // UPDATE
  async update(req, res) {
    try {
      const { id } = req.params;
      const result = await ProductService.updateProduct(id, req.body);
      return this.sendResponse(res, result, "Product updated successfully");
    } catch (error) {
        return this.sendError(res, error.message, [], error.statusCode || 400);
    }
  }

  // DELETE
  async destroy(req, res) {
    try {
      const { id } = req.params;
      await ProductService.deleteProduct(id);
      return this.sendResponse(res, null, "Product deleted successfully");
    } catch (error) {
      return this.sendError(res, error.message, [], error.statusCode || 400);
    }
  }
}

module.exports = new ProductController();