const UserRepository = require("../Repositories/userRepository");
const bcrypt = require("bcryptjs");

const UserService = {
  // Helper: Cek Admin
  checkAdminAccess: (currentUser) => {
    if (!currentUser || currentUser.role !== "admin") {
      const error = new Error("Access denied. Only admin can access user management.");
      error.statusCode = 403;
      throw error;
    }
  },

  // 1. GET List Users
  getAllUsers: async (currentUser, query) => {
    UserService.checkAdminAccess(currentUser);

    const { role, limit } = query;
    const search = query.search || "";
    const page = query.page ? parseInt(query.page) : 1;
    const perPage = limit ? parseInt(limit) : 20;

    return await UserRepository.searchAndPaginate(search, role, page, perPage);
  },

  // 2. Create User
  createUser: async (currentUser, data) => {
    UserService.checkAdminAccess(currentUser);

    if (!data.name || !data.email || !data.password || !data.role) {
      throw new Error("Name, Email, Password, and Role are required.");
    }

    const existingUser = await UserRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error("Email already taken.");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const newUser = {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      status: "active",
    };

    return await UserRepository.create(newUser);
  },

  // 3. Get User Detail (INI YANG TADI ERROR)
  getUserDetail: async (currentUser, id) => {
    // Kalau mau user biasa bisa lihat profil sendiri, hapus baris checkAdminAccess ini.
    // Tapi kalau sesuai PDF (Admin Only), biarkan saja.
    // UserService.checkAdminAccess(currentUser); <--- Opsional tergantung kebutuhan endpoint 'Me'

    // PERBAIKAN: Ganti find jadi findById
    const user = await UserRepository.findById(id); 
    
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const stats = {
      total_recommendations_generated: Math.floor(Math.random() * (200 - 50 + 1)) + 50,
      total_overrides: Math.floor(Math.random() * (20 - 5 + 1)) + 5,
      avg_confidence_score: 84.5,
    };

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status || "active",
      last_login: user.last_login ? new Date(user.last_login).toISOString() : null,
      statistics: stats,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  },

  // 4. Update Status
  updateUserStatus: async (currentUser, id, status) => {
    UserService.checkAdminAccess(currentUser);

    if (!["active", "inactive"].includes(status)) {
      throw new Error("Status must be active or inactive");
    }

    // PERBAIKAN: Ganti find jadi findById
    const user = await UserRepository.findById(id);
    if (!user) throw new Error("User not found");

    return await UserRepository.update(id, { status: status });
  },

  // 5. Delete User
  deleteUser: async (currentUser, id) => {
    UserService.checkAdminAccess(currentUser);

    // PERBAIKAN: Ganti find jadi findById
    const userToDelete = await UserRepository.findById(id);
    if (!userToDelete) throw new Error("User not found");

    if (userToDelete.email === "admin@telco.com") {
      const error = new Error("Tidak diizinkan menghapus Super Admin.");
      error.statusCode = 403;
      throw error;
    }

    if (currentUser.id === id) {
      const error = new Error("Tidak bisa menghapus akun sendiri saat sedang login.");
      error.statusCode = 403;
      throw error;
    }

    return await UserRepository.delete(id);
  },
};

module.exports = UserService;