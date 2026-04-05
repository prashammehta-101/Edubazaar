const Review   = require('../models/Review.model')
const Resource = require('../models/Resource.model')
const Transaction = require('../models/Transaction.model')

// POST /api/reviews/:resourceId
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body
    const { resourceId } = req.params

    // Only buyers who purchased can review
    const purchased = await Transaction.findOne({
      buyerId:       req.user._id,
      resourceId,
      paymentStatus: 'success',
    })
    if (!purchased) {
      return res.status(403).json({ message: 'Purchase this resource first to review it.' })
    }

    const review = await Review.create({
      resourceId,
      userId: req.user._id,
      rating: Number(rating),
      comment,
    })

    // Recalculate average rating on the resource
    const allReviews = await Review.find({ resourceId })
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    await Resource.findByIdAndUpdate(resourceId, {
      averageRating: Math.round(avg * 10) / 10,
      totalReviews:  allReviews.length,
    })

    res.status(201).json({ message: 'Review added.', review })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this resource.' })
    }
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/reviews/:resourceId
const getResourceReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ resourceId: req.params.resourceId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name avatar branch')

    res.json({ reviews })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { addReview, getResourceReviews }