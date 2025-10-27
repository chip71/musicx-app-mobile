const Album = require('../models/albums.js');
const Artist = require('../models/artists.js');
const Genre = require('../models/genres.js');

// ✅ GET all albums
const getAlbums = async (req, res) => {
    try {
        const albums = await Album.find()
            .populate('artistID', 'name image spotify youtube')
            .populate('genreID', 'name');

        res.json(albums);
    } catch (err) {
        console.error('Error fetching albums:', err);
        res.status(500).json({ message: 'Server error fetching albums' });
    }
};

// ✅ GET a single album by its MongoDB _id (populate artist + genre)
const getAlbumById = async (req, res) => {
    try {
        const album = await Album.findById(req.params.id)
            .populate('artistID', 'name image spotify youtube')
            .populate('genreID', 'name');

        if (!album) {
            return res.status(404).json({ message: 'Album not found' });
        }

        res.json(album);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid Album ID format' });
        }
        console.error(`Error fetching album ${req.params.id}:`, err);
        res.status(500).json({ message: 'Server error fetching album' });
    }
};

// ✅ GET albums by artist's MongoDB _id
const getAlbumsByArtistId = async (req, res) => {
    try {
        const artistId = req.params.id;

        // Check artist existence first (optional, but good practice)
        const artistExists = await Artist.findById(artistId);
        if (!artistExists) {
            return res.status(404).json({ message: 'Artist not found' });
        }

        // Find albums for that artist
        const albums = await Album.find({ artistID: artistId })
            .populate('artistID', 'name image')
            .populate('genreID', 'name');

        res.json(albums);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid Artist ID format' });
        }
        console.error(`Error fetching albums for artist ${req.params.id}:`, err);
        res.status(500).json({ message: 'Server error fetching artist albums' });
    }
};

// ✅ ADDED: GET albums by genre's MongoDB _id (for recommendations)
// @route   GET /api/albums/genre/:id?exclude=...
const getAlbumsByGenreId = async (req, res) => {
    try {
        const genreId = req.params.id;
        const excludeAlbumId = req.query.exclude;

        // Find albums matching the genreId
        let query = { genreID: genreId };

        // Exclude the currently viewed album
        if (excludeAlbumId) {
            query._id = { $ne: excludeAlbumId };
        }

        // Find and populate
        const albums = await Album.find(query)
            // .limit(4)
            .populate('artistID', 'name')
            .populate('genreID', 'name');

        res.json(albums);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid Genre ID format' });
        }
        console.error(`Error fetching recommended albums for genre ${req.params.id}:`, err);
        res.status(500).json({ message: 'Server error fetching recommendations' });
    }
};

module.exports = {
    getAlbums,
    getAlbumById,
    getAlbumsByArtistId,
    getAlbumsByGenreId,
};