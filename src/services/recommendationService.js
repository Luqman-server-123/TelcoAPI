const axios = require('axios');
const RecommendationRepository = require("../Repositories/recommendationRepository");
const CustomerRepository = require("../Repositories/customerRepository");
const ProductRepository = require("../Repositories/productRepository");
require('dotenv').config();

const RecommendationService = {
  
  // 1. Generate Recommendation (Integrasi Real ML)
  generateRecommendation: async (currentUser, data) => {
    // A. Ambil Data Customer
    const customer = await CustomerRepository.findById(data.customer_id);
    if (!customer) throw new Error("Customer not found");

    // B. Ambil Semua Produk (Buat Kamus: Nama -> UUID)
    // Kita butuh ini karena ML balikin "Retention Offer" (Nama), kita butuh UUID-nya.
    const allProductsResult = await ProductRepository.findAll({ page: 1, perPage: 1000 });
    const products = allProductsResult.data;

    // C. Siapkan Payload (Sesuai Screenshot Swagger ML)
    const payloadToML = {
        avg_call_duration: parseFloat(customer.avg_call_duration) || 0,
        avg_data_usage_gb: parseFloat(customer.avg_data_usage) || 0,
        complaint_count: customer.complaint_count || 0,
        device_brand: customer.device_brand || "Generic",
        monthly_spend: customer.monthly_spend || 0,
        pct_video_usage: customer.pct_video_usage || 0,
        plan_type: customer.current_plan || "Prepaid",
        sms_freq: customer.avg_sms_count || 0, // Mapping sms_count ke sms_freq
        topup_freq: customer.topup_freq || 0,
        travel_score: customer.travel_score || 0
    };

    let predictionItems = [];
    let processingTime = 0;
    
    try {
        const startTime = Date.now();

        // --- D. TEMBAK API ML ---
        console.log("🚀 Sending to ML...", payloadToML);
        
        const mlResponse = await axios.post(process.env.ML_API_URL, payloadToML, {
            headers: {
                'X-API-Key': process.env.ML_API_KEY, // Header Auth ML
                'Content-Type': 'application/json'
            }
        });
        
        processingTime = Date.now() - startTime;
        const mlResult = mlResponse.data; 

        // --- E. MAPPING HASIL ML (Nama Produk -> UUID DB) ---
        // Format ML: { recommendations: [{ product_name: "X", confidence_score: 0.92, rank: 1 }] }
        if (mlResult.recommendations && Array.isArray(mlResult.recommendations)) {
            
            predictionItems = mlResult.recommendations.map(item => {
                // Cari produk di database yg namanya mirip/sama
                const matchedProduct = products.find(p => 
                    p.name.toLowerCase() === item.product_name.toLowerCase()
                );

                if (matchedProduct) {
                    return {
                        product_id: matchedProduct.id, // UUID dari DB kita
                        rank_order: item.rank,
                        confidence_score: (item.confidence_score * 100).toFixed(2), // 0.92 -> 92.00
                        reasoning: "Recommended by AI Model"
                    };
                } else {
                    console.warn(`⚠️ Produk ML '${item.product_name}' tidak ada di tabel products!`);
                    return null;
                }
            }).filter(item => item !== null);
        }

    } catch (error) {
        console.error("❌ ML Service Error:", error.response?.data || error.message);
        // Error 503 Service Unavailable (Sesuai PDF)
        const err = new Error("ML Service unavailable");
        err.statusCode = 503; 
        throw err;
    }

    // F. Simpan Header
    const recommendationId = await RecommendationRepository.createHeader({
        customer_id: customer.id,
        generated_by_user_id: currentUser.id,
        model_version: "v1.0-ml", 
        algorithm: "NeuralNetwork", 
        processing_time_ms: processingTime
    });

    // G. Simpan Items
    if (predictionItems.length > 0) {
        await RecommendationRepository.createItems(recommendationId, predictionItems);
    } else {
        console.log("⚠️ Tidak ada rekomendasi yang cocok disimpan.");
    }

    // H. Return Hasil
    return await RecommendationRepository.findById(recommendationId);
  },

  // 2. Get Detail
  getRecommendationDetail: async (id) => {
      const data = await RecommendationRepository.findById(id);
      if (!data) {
          const error = new Error("Recommendation not found");
          error.statusCode = 404;
          throw error;
      }
      return data;
  },

  // 3. Get History
  getHistory: async (query) => {
      return await RecommendationRepository.getHistory(query.customer_id);
  },
  // 4. Override Recommendation
  overrideRecommendation: async (currentUser, id, data) => {
      // Cek rekomendasi ada gak
      const recommendation = await RecommendationRepository.findById(id);
      if (!recommendation) throw new Error("Recommendation not found");

      // Cek produk pengganti ada gak
      const product = await ProductRepository.findById(data.product_id);
      if (!product) throw new Error("Override product not found");

      // Lakukan Override
      return await RecommendationRepository.override(id, {
          product_id: data.product_id,
          override_reason: data.override_reason
      });
  },

  // 5. Get Model Info (Dummy sesuai PDF Hal 22)
  getModelInfo: () => {
      // Data statis sesuai dokumen [cite: 751-776]
      return {
          model_version: "v1.2.0",
          model_type: "hybrid_collaborative_filtering",
          last_training_date: "2025-11-20T08:00:00Z",
          metrics: {
              accuracy: 87.5,
              precision: 85.2,
              recall: 83.8,
              f1_score: 84.5
          },
          training_data: {
              total_samples: 1500,
              training_samples: 1200,
              validation_samples: 300
          },
          features_used: [
              "avg_data_usage", "avg_call_duration", "avg_sms_count",
              "clv_segment", "tenure_months", "transaction_frequency"
          ],
          status: "active",
          next_training_scheduled: "2025-12-20T08:00:00Z"
      };
  }
};

module.exports = RecommendationService;