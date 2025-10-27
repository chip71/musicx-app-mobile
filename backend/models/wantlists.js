const mongoose = require("mongoose");

const wantlistSchema = new mongoose.Schema({
  // ✅ Changed type to ObjectId and added ref
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Links to the 'User' model
    required: true 
  }, 
  // ✅ Changed type to ObjectId and added ref
  albumId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Album', // Links to the 'Album' model
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Optional: Add an index for faster lookups based on user and album
wantlistSchema.index({ userId: 1, albumId: 1 }, { unique: true });

module.exports = mongoose.model("Wantlist", wantlistSchema); // Collection name will be 'wantlists' by default