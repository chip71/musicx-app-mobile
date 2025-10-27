const Artist = require('../models/artists.js');
const Album = require('../models/albums.js'); // ✅ For optional population or artist albums

// ======================================
// GET all artists
// ======================================
const getArtists = async (req, res) => {
  try {
    // Fetch all artists (no population for performance)
    const artists = await Artist.find();
    res.json(artists);
  } catch (err) {
    console.error('Error fetching artists:', err);
    res.status(500).json({ message: 'Server error fetching artists' });
  }
};

// ======================================
// GET single artist by MongoDB _id
// ======================================
const getArtistById = async (req, res) => {
  try {
    const artistId = req.params.id;

    // ✅ Find artist
    const artist = await Artist.findById(artistId);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    // ✅ Optionally populate their albums
    const albums = await Album.find({ artistID: artistId })
      .populate('genreID', 'name') // show genre names
      .select('name image releaseYear genreID'); // only needed fields

    // ✅ Combine artist info with their albums
    res.json({
      ...artist.toObject(),
      albums,
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid Artist ID format' });
    }
    console.error(`Error fetching artist ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error fetching artist' });
  }
};

module.exports = {
  getArtists,
  getArtistById,
};
