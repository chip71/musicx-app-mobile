const User = require('../models/users.js');
const crypto = require('crypto');
// ✅ FIX: Import Mongoose
const mongoose = require('mongoose'); 

// Hash helper (consider moving to a utils file and using bcrypt)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// --- GET User By Id (Existing function) ---
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid User ID format' });
    }
    console.error(`Error fetching user ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error fetching user' });
  }
};

// --- UPDATE User Profile (Name) ---
const updateUserProfile = async (req, res) => {
  try {
    // ✅ FIX: Read userId from request body (sent by frontend)
    const userId = req.body.userId;
    if (!userId) {
       return res.status(400).json({ message: 'User ID missing in request body' });
    }

    // ✅ Validate if it's a potentially valid ObjectId format before querying
    if (!mongoose.Types.ObjectId.isValid(userId)) {
       return res.status(400).json({ message: 'Invalid User ID format in request body' });
    }

    const user = await User.findById(userId); // Use the ID from the body

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update name if provided
    user.name = req.body.name || user.name;

    const updatedUser = await user.save();

    // Return updated user data (excluding password)
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
    });

  } catch (err) {
    console.error('Error updating profile:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    // Added check for CastError during findById
    if (err.name === 'CastError') {
       return res.status(400).json({ message: 'Invalid User ID format during lookup' });
    }
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// --- CHANGE User Password ---
const changeUserPassword = async (req, res) => {
  try {
    // ✅ FIX: Read userId from request body (sent by frontend)
    const userId = req.body.userId;
    if (!userId) {
       return res.status(400).json({ message: 'User ID missing in request body' });
    }

    // ✅ Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
       return res.status(400).json({ message: 'Invalid User ID format in request body' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new passwords' });
    }

    const user = await User.findById(userId); // Use the ID from the body
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const storedHashParts = user.passwordHash.split('$');
    const storedHash = storedHashParts[storedHashParts.length - 1];
    const currentInputHash = hashPassword(currentPassword);

    if (currentInputHash !== storedHash) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    // Hash and update to new password
    const newHashed = hashPassword(newPassword);
    user.passwordHash = `sha256$${newHashed}`; // Update hash

    await user.save();

    res.json({ message: 'Password updated successfully' });

  } catch (err) {
      console.error('Error changing password:', err);
      // Added check for CastError during findById
      if (err.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid User ID format during lookup' });
      }
      res.status(500).json({ message: 'Server error changing password' });
  }
};


module.exports = {
  getUserById,
  updateUserProfile,
  changeUserPassword,
};