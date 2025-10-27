const Wantlist = require('../models/wantlists');

// Get all wantlists (potentially filtered by user)
exports.getWantlists = async (req, res) => {
  try {
    const query = req.query.userId ? { userId: req.query.userId } : {};
    const items = await Wantlist.find(query)
      .populate('userId', 'name email')
      .populate('albumId', 'name image artistID price');
    res.json(items);
  } catch (err) {
    console.error('Error fetching wantlists:', err); // Kept error log
    res.status(500).json({ message: err.message });
  }
};

// Add to wantlist
exports.addToWantlists = async (req, res) => {
  try {
    const { userId, albumId } = req.body;
    if (!userId || !albumId) {
      return res.status(400).json({ message: 'Missing userId or albumId' });
    }
    const existing = await Wantlist.findOne({ userId, albumId });
    if (existing) {
      return res.status(400).json({ message: 'Album already in wantlist' });
    }
    const newItem = new Wantlist({ userId, albumId });
    await newItem.save();
    const populatedItem = await Wantlist.findById(newItem._id)
                                      .populate('userId', 'name')
                                      .populate('albumId', 'name');
    res.status(201).json(populatedItem || newItem);
  } catch (err) {
    console.error('Error adding to wantlist:', err); // Kept error log
    res.status(500).json({ message: err.message });
  }
};

// Remove from wantlist
exports.removeFromWantlists = async (req, res) => {
  try {
    const { albumId } = req.params;
    const userId = req.body.userId || req.query.userId;
    if (!userId) {
       return res.status(400).json({ message: 'Missing userId' });
    }
    const removed = await Wantlist.findOneAndDelete({ userId, albumId });
    if (!removed) {
      return res.status(404).json({ message: 'Item not found in wantlist for this user' });
    }
    res.json({ message: 'Removed from wantlist successfully' });
  } catch (err) {
    console.error('Error removing from wantlist:', err); // Kept error log
    res.status(500).json({ message: err.message });
  }
};