const User = require('../models/User.model')
const jwt  = require('jsonwebtoken')
const { validationResult } = require('express-validator')

// Generate JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { name, email, password, role, branch, college } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) return res.status(400).json({ message: 'Email already registered.' })

    const user = await User.create({ name, email, password, role, branch, college })
    const token = generateToken(user._id)

    res.status(201).json({ message: 'Registration successful', token, user })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')
    if (!user) return res.status(400).json({ message: 'Invalid email or password.' })

    const isMatch = await user.matchPassword(password)
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password.' })

    if (!user.isActive) return res.status(403).json({ message: 'Account suspended. Contact admin.' })

    const token = generateToken(user._id)

    res.json({ message: 'Login successful', token, user })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    res.json({ user: req.user })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// PUT /api/auth/me
const updateMe = async (req, res) => {
  try {
    const { name, branch, college, avatar } = req.body

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, branch, college, avatar },
      { new: true, runValidators: true }
    )

    res.json({ message: 'Profile updated', user })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { register, login, getMe, updateMe }