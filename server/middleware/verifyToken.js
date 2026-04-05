const jwt = require('jsonwebtoken')
const User = require('../models/User.model')

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided. Access denied.' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Attach user to request (fetch fresh from DB to get latest role)
    const user = await User.findById(decoded.userId)
    if (!user) return res.status(401).json({ message: 'User not found.' })
    if (!user.isActive) return res.status(403).json({ message: 'Account suspended.' })

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please login again.' })
    }
    return res.status(401).json({ message: 'Invalid token.' })
  }
}

module.exports = verifyToken