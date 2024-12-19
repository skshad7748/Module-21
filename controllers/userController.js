const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });

// Register User
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, NIDNumber, phoneNumber, password, bloodGroup } = req.body;

    const userExists = await User.findOne({ NIDNumber });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ firstName, lastName, NIDNumber, phoneNumber, password, bloodGroup });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { NIDNumber, password } = req.body;

    const user = await User.findOne({ NIDNumber });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    res.cookie('token', token, { httpOnly: true }).json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User Profile
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

// Get All Users
const getAllUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
};

// Update User
const updateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(user);
};

// Delete User
const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
};

module.exports = { registerUser, loginUser, getUserProfile, getAllUsers, updateUser, deleteUser };
