const express = require('express')
const router  = express.Router()
const verifyToken = require('../middleware/verifyToken')
const { toggleWishlist, getWishlist } = require('../controllers/wishlist.controller')

router.post('/:resourceId', verifyToken, toggleWishlist)
router.get('/',             verifyToken, getWishlist)

module.exports = router