const express = require('express');
const router = express.Router();

// Controllers
const albumController = require('../controllers/albumController.js');
const artistController = require('../controllers/artistController.js');
const genreController = require('../controllers/genreController.js');
const userController = require('../controllers/userController.js');
const orderController = require('../controllers/orderController.js');
const paymentController = require('../controllers/paymentController.js');
const authController = require('../controllers/authController.js');
const adminController = require('../controllers/adminController.js');

// Safe wrapper để tránh lỗi controller chưa định nghĩa
const safe = (fn) =>
  typeof fn === 'function'
    ? fn
    : (req, res) => {
        console.error(`❌ ROUTER ERROR: Controller function not found for path ${req.path}`);
        res.status(500).json({
          error: 'Server configuration error: Controller function missing.'
        });
      };

/*
 * ===========================================
 * PUBLIC ROUTES (Music Catalog)
 * ===========================================
 */

// ✅ Albums
router.get('/albums', safe(albumController.getAlbums));
router.get('/albums/artist/:id', safe(albumController.getAlbumsByArtistId));
router.get('/albums/genre/:id', safe(albumController.getAlbumsByGenreId));
router.get('/albums/:id', safe(albumController.getAlbumById));

// ✅ Artists
router.get('/artists', safe(artistController.getArtists));
router.get('/artists/:id', safe(artistController.getArtistById));

// ✅ Genres
router.get('/genres', safe(genreController.getGenres));
router.get('/genres/:id', safe(genreController.getGenreById));

/*
 * ===========================================
 * USER & ORDER ROUTES
 * ===========================================
 */

// 🟢 USER ORDERS (User-side)
router.get('/users/:userId/orders', safe(orderController.getUserOrders)); // user order history
router.post('/orders', safe(orderController.createOrder)); // create new order
router.put('/orders/:id/cancel', safe(orderController.cancelOrder)); // cancel by user

// 🟢 ADMIN ORDERS (Admin-side)
router.get('/orders', safe(orderController.getAllOrders)); // ✅ get all orders
router.get('/orders/:id', safe(orderController.getOrderById)); // ✅ get one order
router.put('/orders/:id', safe(orderController.updateOrder)); // ✅ update status (dropdown)
router.delete('/orders/:id', safe(orderController.deleteOrder)); // ✅ delete order

/*
 * ===========================================
 * USER PROFILE ROUTES
 * ===========================================
 */
router.get('/users/:id', safe(userController.getUserById));
router.put('/users/profile', safe(userController.updateUserProfile));
router.put('/users/password', safe(userController.changeUserPassword));

/*
 * ===========================================
 * AUTH ROUTES
 * ===========================================
 */
router.post('/auth/login', safe(authController.loginUser));
router.post('/auth/register', safe(authController.registerUser));

/*
 * ===========================================
 * ADMIN DASHBOARD ROUTES
 * ===========================================
 */
router.get('/admin/stats', safe(adminController.getAdminStats));
router.get('/admin/revenue', safe(adminController.getRevenueStats));

/*
 * ===========================================
 * PAYMENT ROUTES
 * ===========================================
 */
router.post('/payments/momo/ipn', safe(paymentController.momoNotify));
router.post('/payments/momo/create-link', safe(paymentController.createMoMoPaymentLink));

module.exports = router;
