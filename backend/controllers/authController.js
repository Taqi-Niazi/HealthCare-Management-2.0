// backend/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');        // password hashing
const jwt = require('jsonwebtoken');     // token creation

// register handler
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;         // get fields
    if (!name || !email || !password)                        // simple validation
      return res.status(400).json({ message: 'Missing fields' });

    const existing = await User.findOne({ email });           // check duplicate
    if (existing) return res.status(400).json({ message: 'Email in use' });

    const salt = await bcrypt.genSalt(10);                   // generate salt
    const hashed = await bcrypt.hash(password, salt);        // hash password

    const user = await User.create({ name, email, password: hashed, role });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role }});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// login handler
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;                     // get credentials
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password); // compare hash
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role }});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// me - protected endpoint returns current user basic info
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // omit password
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
