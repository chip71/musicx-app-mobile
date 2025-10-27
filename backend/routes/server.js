// This file is the main entry point for your backend
require('dotenv').config({ path: __dirname + '/../.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- ADD THIS LINE (1 of 2) ---
// This imports the api.js file you just created
const apiRoutes = require('./api.js'); 

// Initialize the app
const app = express();

// --- UPDATE #2: CORS Configuration for Web ---
// Configure CORS to allow our web app
const corsOptions = {
  origin: 'http://localhost:8081', // This is the default port for Expo Web
  optionsSuccessStatus: 200 
};
app.use(cors(corsOptions));
// --- END OF UPDATE ---

app.use(express.json());

// --- MongoDB Connection ---
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error('MONGO_URI is not defined in your .env file. Please create it.');
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully! 🚀'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// --- Test Route ---
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the MusicX API! 🎧' });
});

// --- ADD THIS LINE (2 of 2) ---
// This tells Express to use your API routes
// Any request starting with /api will be handled by apiRoutes
app.use('/api', apiRoutes);

// --- Start the Server ---
const PORT = process.env.PORT || 9999;
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});