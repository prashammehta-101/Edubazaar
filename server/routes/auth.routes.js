const express  = require('express')
const router   = express.Router()
const { body } = require('express-validator')
const { register, login, getMe, updateMe } = require('../controllers/auth.controller')
const verifyToken = require('../middleware/verifyToken')

router.post('/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['buyer', 'seller']).withMessage('Role must be buyer or seller'),
  ],
  register
)

router.post('/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
)

router.get('/me',    verifyToken, getMe)
router.put('/me',    verifyToken, updateMe)

module.exports = router