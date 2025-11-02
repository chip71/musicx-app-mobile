// server.js (main backend entry)
require('dotenv').config({ path: __dirname + '/../.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// --- Import API routes ---
const apiRoutes = require('./api.js');

const app = express();

/* =========================================================
   🌐 CORS CONFIG (cho web + mobile)
========================================================= */
const corsOptions = {
  origin: [
    'http://localhost:8081', // Expo Web
    'http://localhost:3000', // React Web (nếu dùng)
    'http://10.0.2.2:9999',  // Android emulator (backend)
    'http://192.168.',       // Mạng LAN (Expo mobile)
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

/* =========================================================
   📦 CONNECT TO MONGO
========================================================= */
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error('❌ MONGO_URI missing in .env');
}

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB Connected Successfully! 🚀'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

/* =========================================================
   🔗 API ROUTES
========================================================= */
app.use('/api', apiRoutes);

/* =========================================================
   🧪 TEST ROUTE
========================================================= */
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the MusicX API! 🎧' });
});

/* =========================================================
   🚀 START SERVER
========================================================= */
const PORT = process.env.PORT || 9999;
app.listen(PORT, () => {
  console.log(`🚀 Server running at: http://localhost:${PORT}`);
});
