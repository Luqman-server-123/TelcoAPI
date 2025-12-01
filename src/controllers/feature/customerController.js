const BaseController = require("../baseController");
const CustomerService = require("../../services/customerService");

class CustomerController extends BaseController {
  
  /**
   * 1. GET List Customers
   * Endpoint: GET /feature/customers
   * Mendukung pagination, search, dan filter status
   */
  async index(req, res) {
    try {
      // req.query isinya: ?page=1&limit=20&search=john&status=active
      const result = await CustomerService.getAllCustomers(req.query);
      return this.sendResponse(res, result, "Customers retrieved successfully");
    } catch (error) {
      return this.sendError(res, error.message, [], error.statusCode || 500);
    }
  }

  /**
   * 2. GET Detail Customer
   * Endpoint: GET /feature/customers/:id
   */
  async show(req, res) {
    try {
      const { id } = req.params;
      const result = await CustomerService.getCustomerById(id);
      return this.sendResponse(res, result, "Customer detail retrieved successfully");
    } catch (error) {
      return this.sendError(res, error.message, [], error.statusCode || 404);
    }
  }

  /**
   * 3. CREATE Customer
   * Endpoint: POST /feature/customers
   * Di sini logic CUST-001 akan dijalankan otomatis oleh Service
   */
  async store(req, res) {
    try {
      const result = await CustomerService.createCustomer(req.body);
      
      // Set status 201 (Created) sebelum kirim response
      res.status(201);
      
      return this.sendResponse(res, result, "Customer created successfully");
    } catch (error) {
      return this.sendError(res, error.message, [], error.statusCode || 400);
    }
  }

  /**
   * 4. UPDATE Customer
   * Endpoint: PUT /feature/customers/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const result = await CustomerService.updateCustomer(id, req.body);
      return this.sendResponse(res, result, "Customer updated successfully");
    } catch (error) {
        return this.sendError(res, error.message, [], error.statusCode || 400);
    }
  }

  /**
   * 5. DELETE Customer
   * Endpoint: DELETE /feature/customers/:id
   */
  async destroy(req, res) {
    try {
      const { id } = req.params;
      await CustomerService.deleteCustomer(id);
      return this.sendResponse(res, null, "Customer deleted successfully");
    } catch (error) {
      return this.sendError(res, error.message, [], error.statusCode || 400);
    }
  }
  // GET /feature/customers/statistics
  async getStatistics(req, res) {
    try {
      const result = await CustomerService.getCustomerStats();
      return this.sendResponse(res, result, "Customer statistics retrieved successfully");
    } catch (error) {
      return this.sendError(res, error.message, [], error.statusCode || 500);
    }
  }
}

module.exports = new CustomerController();