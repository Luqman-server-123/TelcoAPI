const CustomerRepository = require("../repositories/customerRepository");
const db = require("../config/database");

const CustomerService = {
  // 1. Get List
  getAllCustomers: async (query) => {
    const { search, status, sort_by, sort_order, page, limit } = query;
    
    return await CustomerRepository.findAll({
      search,
      status,
      sortBy: sort_by,
      sortOrder: sort_order,
      page: page || 1,
      perPage: limit || 20
    });
  },

  // 2. Get Detail
  getCustomerById: async (id) => {
    const customer = await CustomerRepository.findById(id);
    if (!customer) {
      const error = new Error("Customer not found");
      error.statusCode = 404;
      throw error;
    }
    return customer;
  },

  // 3. Create Customer (BAGIAN INI YANG TADI ERROR)
  createCustomer: async (data) => {
    // Validasi
    if (!data.name || !data.location) {
      const error = new Error("Nama dan Lokasi wajib diisi");
      error.statusCode = 400;
      throw error;
    }

    // --- LOGIC GENERATE KODE ---
    let newCode = "CUST-001"; 

    // PERBAIKAN: Ganti 'ORDER BY created_at' jadi 'ORDER BY customer_code'
    // Supaya dia ngambil CUST-010 sebagai yang terakhir, bukan CUST-001
    const [lastCustomer] = await db.query(
        "SELECT customer_code FROM customers WHERE customer_code IS NOT NULL ORDER BY customer_code DESC LIMIT 1"
    );

    if (lastCustomer.length > 0) {
        const lastCode = lastCustomer[0].customer_code; // Pasti dapat CUST-010
        const numberPart = parseInt(lastCode.split("-")[1]); // 10
        const nextNumber = numberPart + 1; // 11
        newCode = `CUST-${String(nextNumber).padStart(3, "0")}`; // CUST-011
    }
    // ----------------------------

    const newCustomer = {
        ...data,
        customer_code: newCode,
        age: data.age || 0,
        status: "active",
        avg_data_usage: 0,
        avg_call_duration: 0,
        avg_sms_count: 0
    };

    return await CustomerRepository.create(newCustomer);
  },

  // 4. Update Customer
  updateCustomer: async (id, data) => {
      const existing = await CustomerRepository.findById(id);
      if (!existing) {
          const error = new Error("Customer not found");
          error.statusCode = 404;
          throw error;
      }
      return await CustomerRepository.update(id, data);
  },

  // 5. Delete Customer
  deleteCustomer: async (id) => {
    const existing = await CustomerRepository.findById(id);
    if (!existing) {
        const error = new Error("Customer not found");
        error.statusCode = 404;
        throw error;
    }
    return await CustomerRepository.delete(id);
  },

  // 6. Get Statistics
  getCustomerStats: async () => {
    const rawStats = await CustomerRepository.getStats();
    
    const general = rawStats.general;
    const segments = rawStats.segments;

    const segmentMap = {
        high_value: 0,
        medium_value: 0,
        low_value: 0
    };

    segments.forEach(item => {
        if (item.clv_segment) {
            segmentMap[item.clv_segment] = item.count;
        }
    });

    const activeRatio = general.total_customers > 0 
        ? (general.active_customers / general.total_customers) * 100 
        : 0;

    return {
        total_customers: general.total_customers,
        active_customers: parseInt(general.active_customers) || 0,
        churned_customers: parseInt(general.churned_customers) || 0,
        active_ratio: parseFloat(activeRatio.toFixed(1)),
        clv_segments: segmentMap,
        average_clv: 2500000, 
        average_tenure_months: Math.round(general.avg_tenure_months) || 0
    };
  }
};

module.exports = CustomerService;