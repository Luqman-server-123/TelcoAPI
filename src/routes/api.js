const express = require('express');
const router = express.Router();

// --- IMPORT CONTROLLERS ---
const AuthController = require('../controllers/auth/authController');
const DashboardController = require('../controllers/feature/dashboardController');
const UserController = require('../controllers/feature/userController');
const CustomerController = require('../controllers/feature/customerController');
const ProductController = require('../controllers/feature/productController');
const RecommendationController = require('../controllers/feature/recommendationController');

// --- IMPORT MIDDLEWARE ---
const authMiddleware = require('../middleware/authMiddleware');

// ==============================================================================
// 1. AUTHENTICATION (Public & Protected)
// Prefix: /authentication
// ==============================================================================
router.post('/authentication/login', (req, res) => AuthController.login(req, res));
router.post('/authentication/refresh', (req, res) => AuthController.refresh(req, res));
router.post('/authentication/logout', authMiddleware, (req, res) => AuthController.logout(req, res));
router.get('/authentication/profile', authMiddleware, (req, res) => AuthController.me(req, res));


// ==============================================================================
// 2. DASHBOARD & ANALYTICS
// Prefix: /feature/dashboard
// ==============================================================================
router.get('/feature/dashboard/overview', authMiddleware, (req, res) => DashboardController.overview(req, res));
// Note: Route export ditaruh sebelum route performance biasa (best practice)
router.get('/feature/dashboard/product-performance/export', authMiddleware, (req, res) => DashboardController.export(req, res));
router.get('/feature/dashboard/product-performance', authMiddleware, (req, res) => DashboardController.productPerformance(req, res));
router.get('/feature/dashboard/model-info', authMiddleware, (req, res) => DashboardController.modelInfo(req, res));


// ==============================================================================
// 3. USER MANAGEMENT (Admin Only)
// Prefix: /feature/users
// ==============================================================================
router.get('/feature/users', authMiddleware, (req, res) => UserController.index(req, res));
router.post('/feature/users', authMiddleware, (req, res) => UserController.store(req, res));
router.get('/feature/users/:id', authMiddleware, (req, res) => UserController.show(req, res));
router.patch('/feature/users/:id/status', authMiddleware, (req, res) => UserController.updateStatus(req, res));
router.delete('/feature/users/:id', authMiddleware, (req, res) => UserController.destroy(req, res));


// ==============================================================================
// 4. CUSTOMER MANAGEMENT
// Prefix: /feature/customers
// ==============================================================================
// PENTING: Route 'statistics' WAJIB di atas route ':id' agar tidak dianggap sebagai ID
router.get('/feature/customers/statistics', authMiddleware, (req, res) => CustomerController.getStatistics(req, res));

router.get('/feature/customers', authMiddleware, (req, res) => CustomerController.index(req, res));
router.post('/feature/customers', authMiddleware, (req, res) => CustomerController.store(req, res));
router.get('/feature/customers/:id', authMiddleware, (req, res) => CustomerController.show(req, res));
router.put('/feature/customers/:id', authMiddleware, (req, res) => CustomerController.update(req, res));
router.delete('/feature/customers/:id', authMiddleware, (req, res) => CustomerController.destroy(req, res));


// ==============================================================================
// 5. PRODUCT MANAGEMENT
// Prefix: /feature/products
// ==============================================================================
// PENTING: Route 'categories' WAJIB di atas route ':id'
router.get('/feature/products/categories', authMiddleware, (req, res) => ProductController.categories(req, res));

router.get('/feature/products', authMiddleware, (req, res) => ProductController.index(req, res));
router.post('/feature/products', authMiddleware, (req, res) => ProductController.store(req, res));
router.get('/feature/products/:id', authMiddleware, (req, res) => ProductController.show(req, res));
router.put('/feature/products/:id', authMiddleware, (req, res) => ProductController.update(req, res));
router.delete('/feature/products/:id', authMiddleware, (req, res) => ProductController.destroy(req, res));


// ==============================================================================
// 6. RECOMMENDATION SYSTEM (ML Integration)
// Prefix: /feature/recommendations
// ==============================================================================
router.post('/feature/recommendations/generate', authMiddleware, (req, res) => RecommendationController.generate(req, res));
router.get('/feature/recommendations/history', authMiddleware, (req, res) => RecommendationController.history(req, res));
router.post('/feature/recommendations/:id/override', authMiddleware, (req, res) => RecommendationController.override(req, res));
router.get('/feature/recommendations/:id', authMiddleware, (req, res) => RecommendationController.show(req, res));


module.exports = router;