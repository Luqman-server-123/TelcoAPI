const UserRepository = require("../Repositories/userRepository");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const AuthService = {
  // Logic Login
  login: async (email, password) => {
    // 1. Cari User
    const user = await UserRepository.findByEmail(email);
    
    // Gabungkan error user not found & password
    if (!user) {
      const error = new Error("Email atau password salah");
      error.statusCode = 401;
      throw error;
    }

    // 2. Cek Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error("Email atau password salah");
      error.statusCode = 401;
      throw error;
    }

    // 3. Cek Status
    if (user.status !== "active") {
      const error = new Error("Akun dinonaktifkan. Hubungi admin.");
      error.statusCode = 403;
      throw error;
    }

    // 4. Update Last Login (Format SQL Aman)
    await UserRepository.update(user.id, { 
        last_login: new Date().toISOString().slice(0, 19).replace('T', ' ') 
    });

    // 5. Generate Token
    const tokens = AuthService.generateTokens(user);

    // 6. Hapus password dari object user
    // Kita clone dulu object-nya biar aman, baru delete password
    const userResponse = { ...user };
    delete userResponse.password;

    return {
      user: userResponse,
      token: tokens,
    };
  },

  // Logic Register
  register: async (data) => {
    if (!data.email || !data.password || !data.name) {
      const error = new Error("Nama, Email, dan Password wajib diisi");
      error.statusCode = 400;
      throw error;
    }

    const existingUser = await UserRepository.findByEmail(data.email);
    if (existingUser) {
      const error = new Error("Email sudah terdaftar");
      error.statusCode = 422;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const newUser = {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: "staff", // Default role staff (admin cuma lewat seeder)
      status: "active",
    };

    const createdUser = await UserRepository.create(newUser);
    const tokens = AuthService.generateTokens(createdUser);

    // Clone & hapus password
    const userResponse = { ...createdUser };
    delete userResponse.password;

    return {
      user: userResponse,
      token: tokens,
    };
  },

  // Helper Generate Token
  generateTokens: (user) => {
    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    const refreshToken = jwt.sign({ id: user.id }, refreshSecret, {
      expiresIn: "7d",
    });

    return {
      access: accessToken,
      refresh: refreshToken,
      type: "Bearer",
      expires_in: 7200,
    };
  },
  // Logic Refresh Token
  refreshToken: async (token) => {
    if (!token) {
      const error = new Error("Refresh token is required");
      error.statusCode = 400;
      throw error;
    }

    try {
      // DEBUG: Cek dulu apakah SECRET-nya kebaca sama server atau undefined?
      const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
      console.log("----------------------------------------");
      console.log("🕵️ DEBUG REFRESH TOKEN");
      console.log("🔑 Secret yang dipakai server:", refreshSecret);
      console.log("🎫 Token yang dikirim Postman:", token);

      const decoded = jwt.verify(token, refreshSecret);
      console.log("✅ Token Valid! User ID:", decoded.id);

      // ... logic cari user dan return token baru ...
      const user = await UserRepository.findById(decoded.id);
      if (!user) throw new Error("User not found");
      const newTokens = AuthService.generateTokens(user);
      return { token: newTokens };

    } catch (err) {
      // DEBUG: Lihat error aslinya apa
      console.log("❌ ERROR VERIFIKASI:", err.message); 
      console.log("----------------------------------------");

      const error = new Error("Refresh token is invalid or expired");
      error.statusCode = 401;
      throw error;
    }
  },
};

module.exports = AuthService;