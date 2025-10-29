const express = require('express');
const router = express.Router();

// Controllers
const albumController = require('../controllers/albumController.js');
const artistController = require('../controllers/artistController.js');
const genreController = require('../controllers/genreController.js');
const userController = require('../controllers/userController.js');
const orderController = require('../controllers/orderController.js');
const paymentController = require('../controllers/paymentController.js');
const wantlistController = require('../controllers/wantlistController.js');
const authController = require('../controllers/authController.js');

// Safety wrapper
const safe = (fn) =>
  typeof fn === 'function'
    ? fn
    : (req, res) => {
        console.error(`❌ ROUTER ERROR: Controller function not found for path ${req.path}`);
        res.status(500).json({ error: 'Server configuration error: Controller function missing.' });
      };

/*
 * ===========================================
 * PUBLIC ROUTES (Music Catalog)
 * ===========================================
 */

// ✅ Albums (Order matters for /:id and /artist/:id)
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

// ✅ Orders
router.get('/users/:userId/orders', safe(orderController.getUserOrders)); // 👈 Fetch user's orders
router.get('/orders', safe(orderController.getOrders)); // 👈 Admin or all orders
router.post('/orders', safe(orderController.createOrder)); // 👈 Create new order

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
 * WANTLIST ROUTES
 * ===========================================
 */

router.get('/wantlists', safe(wantlistController.getWantlists));
router.post('/wantlists', safe(wantlistController.addToWantlists));
router.delete('/wantlists/:albumId', safe(wantlistController.removeFromWantlists));

/*
 * ===========================================
 * AUTH ROUTES
 * ===========================================
 */

router.post('/auth/login', safe(authController.loginUser));
router.post('/auth/register', safe(authController.registerUser));

/*
 * ===========================================
 * PAYMENT ROUTES
 * ===========================================
 */
router.post('/payments/momo/ipn', safe(paymentController.momoNotify));
router.post('/payments/momo/create-link', safe(paymentController.createMoMoPaymentLink));

module.exports = router;
