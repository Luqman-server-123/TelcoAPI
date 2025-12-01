const BaseController = require("../baseController");
const UserService = require("../../services/userService");

class UserController extends BaseController {
  /**
   * 1. GET All Users
   */
  async index(req, res) {
    try {
      // req.user didapat dari middleware auth (token)
      const result = await UserService.getAllUsers(req.user, req.query);
      
      // Result dari service formatnya { data: [...], meta: {...} }
      // Kita kirim apa adanya biar BaseController yang ngerapihin
      return this.sendResponse(res, result, "User list retrieved successfully");
    } catch (error) {
      return this.sendError(res, error.message, [], error.statusCode || 500);
    }
  }

  /**
   * 2. Create User
   */
  async store(req, res) {
    try {
      const result = await UserService.createUser(req.user, req.body);
      
      // PERBAIKAN: Set status 201 (Created) SEBELUM kirim response
      res.status(201); 
      
      return this.sendResponse(
        res,
        result,
        "User created successfully"
      );
    } catch (error) {
      // Error 400 atau 422 (Validation)
      return this.sendError(res, error.message, [], error.statusCode || 400);
    }
  }

  /**
   * 3. Show Detail
   */
  async show(req, res) {
    try {
      const { id } = req.params;
      const result = await UserService.getUserDetail(req.user, id);
      return this.sendResponse(
        res,
        result,
        "User details retrieved successfully"
      );
    } catch (error) {
      return this.sendError(res, error.message, [], error.statusCode || 404);
    }
  }

  /**
   * 4. Update Status
   */
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await UserService.updateUserStatus(req.user, id, status);
      return this.sendResponse(res, result, "User status updated successfully");
    } catch (error) {
      return this.sendError(res, error.message, [], error.statusCode || 400);
    }
  }

  /**
   * 5. Delete User
   */
  async destroy(req, res) {
    try {
      const { id } = req.params;
      await UserService.deleteUser(req.user, id);
      return this.sendResponse(res, null, "User deleted successfully");
    } catch (error) {
      return this.sendError(res, error.message, [], error.statusCode || 400);
    }
  }
}

module.exports = new UserController();