const User = require('../models/users'); // Use correct path
const crypto = require('crypto');

// Hash helper (simple SHA256, consider using bcrypt in production)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// ✅ Login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // --- Password Check ---
    // Extract the hash part from your stored passwordHash
    // (Assumes format like "sha256$<salt_if_any>$hash" or "sha256$hash")
    const storedHashParts = user.passwordHash.split('$');
    const storedHash = storedHashParts[storedHashParts.length - 1]; // Get the last part
    const inputHash = hashPassword(password);

    if (inputHash !== storedHash) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    // --- End Password Check ---

    // ✅ Return _id instead of numeric id
    res.json({
      _id: user._id, // Send the MongoDB _id
      name: user.name,
      email: user.email,
    });

  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// ✅ Register
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashed = hashPassword(password);
    
    // Create user WITHOUT the numeric 'id' field
    const newUser = await User.create({
      name,
      email,
      // Store hash in a consistent format (adjust if you add salts later)
      passwordHash: `sha256$${hashed}`,
      role: 'customer',
      // 'createdAt' is handled by Mongoose default 'timestamps: true' if you add it to your schema
    });

    // ✅ Return _id instead of numeric id
    res.status(201).json({
      _id: newUser._id, // Send the MongoDB _id
      name: newUser.name,
      email: newUser.email,
    });

  } catch (err) {
    console.error('❌ Register error:', err);
    // Provide more detail if it's a validation error
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
};