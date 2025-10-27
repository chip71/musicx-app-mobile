const Genre = require('../models/genres.js');

// GET all genres
const getGenres = async (req, res) => {
  try {
    const genres = await Genre.find();
    res.json(genres);
  } catch (err) {
    console.error('Error fetching genres:', err);
    res.status(500).json({ message: 'Server error fetching genres' });
  }
};

// GET a single genre by its MongoDB _id
const getGenreById = async (req, res) => {
  try {
    // ✅ --- THIS IS THE FIX ---
    // Use Mongoose's findById, which automatically handles the string _id
    const genre = await Genre.findById(req.params.id);

    if (!genre) {
      return res.status(404).json({ message: 'Genre not found' });
    }
    res.json(genre);
  } catch (err) {
    // Handle potential CastError if the ID format is invalid
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid Genre ID format' });
    }
    console.error(`Error fetching genre ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error fetching genre' });
  }
};

module.exports = {
  getGenres,
  getGenreById,
};