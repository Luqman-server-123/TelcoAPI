const BaseController = require("../baseController");
const AuthService = require("../../services/authService");
const UserService = require("../../services/userService");

class AuthController extends BaseController {
  // 1. Login
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      return this.sendResponse(res, result, "Login successful");
    } catch (error) {
      return this.sendError(res, error.message, [], error.statusCode || 500);
    }
  }

  // 2. Register
  async register(req, res) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201);
      return this.sendResponse(res, result, "Registration successful");
    } catch (error) {
      return this.sendError(res, error.message, [], error.statusCode || 400);
    }
  }

  // 3. Get Profile (Me)
  async me(req, res) {
    try {
      if (!req.user || !req.user.id) {
        throw new Error("User tidak terautentikasi");
      }
      const userProfile = await UserService.getUserDetail(
        req.user,
        req.user.id
      );
      return this.sendResponse(
        res,
        userProfile,
        "Profile retrieved successfully"
      );
    } catch (error) {
      return this.sendError(res, error.message, [], error.statusCode || 401);
    }
  }

  // 4. Logout
  async logout(req, res) {
    return this.sendResponse(res, null, "Logout successful");
  }

  // 5. Refresh Token (INI YANG KEMARIN HILANG/ERROR)
  async refresh(req, res) {
    try {
      const { refresh_token } = req.body;
      const result = await AuthService.refreshToken(refresh_token);
      return this.sendResponse(res, result, "Token refreshed successfully");
    } catch (error) {
      return this.sendError(res, error.message, [], error.statusCode || 401);
    }
  }
}

module.exports = new AuthController();
