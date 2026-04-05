const express = require('express')
const router  = express.Router()
const verifyToken = require('../middleware/verifyToken')
const { addReview, getResourceReviews } = require('../controllers/review.controller')

router.post('/:resourceId', verifyToken, addReview)
router.get('/:resourceId',  getResourceReviews)

module.exports = router