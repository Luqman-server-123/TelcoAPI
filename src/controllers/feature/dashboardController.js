const BaseController = require("../baseController");
const DashboardService = require("../../services/dashboardService");

class DashboardController extends BaseController {
  
  // GET /feature/dashboard/overview
  async overview(req, res) {
    try {
      const result = await DashboardService.getDashboardOverview(req.query);
      return this.sendResponse(res, result, "Dashboard overview retrieved successfully");
    } catch (error) {
      return this.sendError(res, error.message, [], error.statusCode || 500);
    }
  }

  // GET /feature/dashboard/product-performance
  async productPerformance(req, res) {
    try {
      const result = await DashboardService.getProductPerformance(req.query);
      return this.sendResponse(res, result, "Product performance retrieved successfully");
    } catch (error) {
      return this.sendError(res, error.message, [], error.statusCode || 500);
    }
  }
  async export(req, res) {
    try {
      const csvData = await DashboardService.exportProductPerformance();
      
      if (!csvData) {
          return this.sendError(res, "No data available to export", [], 404);
      }

      // Set Header biar dianggap File Download (Sesuai PDF)
      res.header('Content-Type', 'text/csv');
      res.attachment('product_performance.csv'); // Nama file saat didownload
      
      return res.send(csvData);

    } catch (error) {
      return this.sendError(res, error.message, [], 500);
    }
  }

  async modelInfo(req, res) {
    try {
      // Panggil service recommendation (karena info model ada di ranah ML)
      // Atau pindahkan logicnya ke DashboardService juga boleh. 
      // Di sini kita pinjam RecommendationService biar cepat.
      const RecommendationService = require("../../services/recommendationService");
      const result = RecommendationService.getModelInfo();
      
      return this.sendResponse(res, result, "Model information retrieved successfully");
    } catch (error) {
      return this.sendError(res, error.message, [], 500);
    }
  }

}

module.exports = new DashboardController();