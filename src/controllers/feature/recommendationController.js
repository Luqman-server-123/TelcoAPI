const BaseController = require("../baseController");
const RecommendationService = require("../../services/recommendationService");

class RecommendationController extends BaseController {
  
  // POST /generate
  async generate(req, res) {
    try {
      const result = await RecommendationService.generateRecommendation(req.user, req.body);
      return this.sendResponse(res, result, "Recommendation generated successfully");
    } catch (error) {
        // Handle error ML mati (503) atau error lain
        return this.sendError(res, error.message, [], error.statusCode || 500);
    }
  }

  // GET /:id
  async show(req, res) {
    try {
      const { id } = req.params;
      const result = await RecommendationService.getRecommendationDetail(id);
      return this.sendResponse(res, result, "Recommendation detail retrieved successfully");
    } catch (error) {
      return this.sendError(res, error.message, [], error.statusCode || 404);
    }
  }

  // GET /history
  async history(req, res) {
    try {
      const result = await RecommendationService.getHistory(req.query);
      return this.sendResponse(res, result, "Recommendation history retrieved successfully");
    } catch (error) {
      return this.sendError(res, error.message, [], error.statusCode || 500);
    }
  }

  // PUT /:id/override
  async override(req, res) {
    try {
      const { id } = req.params;
      const result = await RecommendationService.overrideRecommendation(req.user, id, req.body);
      return this.sendResponse(res, result, "Recommendation overridden successfully");
    } catch (error) {
      return this.sendError(res, error.message, [], error.statusCode || 500);
    }
  }

}

module.exports = new RecommendationController();