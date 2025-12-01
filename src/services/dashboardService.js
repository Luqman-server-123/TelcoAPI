const DashboardRepository = require("../Repositories/dashboardRepository");
const { Parser } = require('json2csv');
const DashboardService = {
  // 1. Get Overview Data
  getDashboardOverview: async (query) => {
    const { date_from, date_to } = query;
    const stats = await DashboardRepository.getOverviewStats(date_from, date_to);

    // Hitung Ratio Active vs Churned
    const totalCust = stats.customers.total_customers;
    const activeCust = parseInt(stats.customers.active);
    const activeRatio = totalCust > 0 ? (activeCust / totalCust) * 100 : 0;

    return {
        kpi: {
            total_customers: totalCust,
            total_recommendations: stats.recommendations.total_recs,
            avg_confidence_score: parseFloat(stats.avg_score).toFixed(1)
        },
        active_vs_churned_ratio: {
            active: activeCust,
            churned: parseInt(stats.customers.churned),
            ratio_percentage: parseFloat(activeRatio.toFixed(1))
        },
        // Data Top 5 Produk sekalian buat preview
        top_products: await DashboardRepository.getProductPerformance(5)
    };
  },

  // 2. Get Product Performance List
  getProductPerformance: async (query) => {
      const limit = query.limit || 10;
      const data = await DashboardRepository.getProductPerformance(limit);
      
      // Tambah logic 'Revenue Potential' (Harga x Jumlah Rekomendasi)
      // Sesuai PDF hal 20 [cite: 701]
      return data.map(item => ({
          ...item,
          revenue_potential: item.price * item.times_recommended,
          trend: "stable" // Dummy logic
      }));
  },
  
  exportProductPerformance: async () => {
      // Ambil data banyak (misal limit 1000 biar semua keambil)
      const data = await DashboardRepository.getProductPerformance(1000);
      
      if (data.length === 0) {
          return null;
      }

      // Format Data biar kolom CSV-nya Cantik
      const formattedData = data.map(item => ({
          "Product ID": item.product_id,
          "Product Name": item.product_name,
          "Category": item.category,
          "Price": item.price,
          "Times Recommended": item.times_recommended,
          "Avg Confidence Score": parseFloat(item.avg_confidence).toFixed(2),
          "Potential Revenue": item.price * item.times_recommended
      }));

      // Convert JSON ke CSV String
      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(formattedData);
      
      return csv;
  }


};

module.exports = DashboardService;