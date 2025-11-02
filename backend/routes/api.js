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

// --- Safe wrapper để tránh lỗi controller ---
const safe = (fn) =>
  typeof fn === 'function'
    ? fn
    : (req, res) => {
        console.error(`❌ ROUTER ERROR: Controller function not found for path ${req.path}`);
        res.status(500).json({
          error: 'Server configuration error: Controller function missing.',
        });
      };

/* =========================================================
   🎵 PUBLIC ROUTES (Music Catalog)
========================================================= */
router.get('/albums', safe(albumController.getAlbums));
router.get('/albums/:id', safe(albumController.getAlbumById));
router.get('/albums/artist/:id', safe(albumController.getAlbumsByArtistId));
router.get('/albums/genre/:id', safe(albumController.getAlbumsByGenreId));

router.get('/artists', safe(artistController.getArtists));
router.get('/artists/:id', safe(artistController.getArtistById));

router.get('/genres', safe(genreController.getGenres));
router.get('/genres/:id', safe(genreController.getGenreById));

/* =========================================================
   👤 USER & ORDER ROUTES
========================================================= */
router.get('/users/:userId/orders', safe(orderController.getUserOrders));
router.post('/orders', safe(orderController.createOrder));
router.put('/orders/:id/cancel', safe(orderController.cancelOrder));
router.get('/orders', safe(orderController.getAllOrders));
router.get('/orders/:id', safe(orderController.getOrderById));
router.put('/orders/:id', safe(orderController.updateOrder));
router.delete('/orders/:id', safe(orderController.deleteOrder));

/* =========================================================
   👤 USER PROFILE
========================================================= */
router.get('/users/:id', safe(userController.getUserById));
router.put('/users/profile', safe(userController.updateUserProfile));
router.put('/users/password', safe(userController.changeUserPassword));

/* =========================================================
   🔐 AUTH
========================================================= */
router.post('/auth/login', safe(authController.loginUser));
router.post('/auth/register', safe(authController.registerUser));

/* =========================================================
   🧠 ADMIN DASHBOARD
========================================================= */
router.get('/admin/stats', safe(adminController.getAdminStats));
router.get('/admin/revenue', safe(adminController.getRevenueStats));

/* =========================================================
   💿 ADMIN ALBUM CRUD (no upload, chỉ nhận link ảnh)
========================================================= */
router.post('/albums', safe(albumController.createAlbum));
router.put('/albums/:id', safe(albumController.updateAlbum));
router.delete('/albums/:id', safe(albumController.deleteAlbum));

/* =========================================================
   💿 ADMIN ARTIST CRUD (for ManageArtistsScreen)
========================================================= */
router.post('/artists', safe(artistController.createArtist));
router.put('/artists/:id', safe(artistController.updateArtist));
router.delete('/artists/:id', safe(artistController.deleteArtist));
/* =========================================================
   💿 ADMIN GENRE CRUD (for ManageGenresScreen)
========================================================= */
router.post('/genres', safe(genreController.createGenre));
router.put('/genres/:id', safe(genreController.updateGenre));
router.delete('/genres/:id', safe(genreController.deleteGenre));

/* =========================================================
   💰 PAYMENTS (MoMo)
========================================================= */
router.post('/payments/momo/ipn', safe(paymentController.momoNotify));
router.post('/payments/momo/create-link', safe(paymentController.createMoMoPaymentLink));

/* =========================================================
   ✅ EXPORT ROUTER
========================================================= */
module.exports = router;
