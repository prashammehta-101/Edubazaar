const Transaction = require('../models/Transaction.model')
const Resource    = require('../models/Resource.model')

// POST /api/transactions/purchase
const purchaseResource = async (req, res) => {
  try {
    const { resourceId } = req.body

    const resource = await Resource.findById(resourceId)
    if (!resource) return res.status(404).json({ message: 'Resource not found.' })
    if (resource.approved !== 'approved') return res.status(400).json({ message: 'Resource not available.' })

    // Check if already purchased
    const existing = await Transaction.findOne({
      buyerId:       req.user._id,
      resourceId,
      paymentStatus: 'success',
    })
    if (existing) return res.status(400).json({ message: 'You already own this resource.' })

    // Free resource — still create a transaction record
    const transaction = await Transaction.create({
      buyerId:    req.user._id,
      resourceId,
      amount:     resource.price,
      paymentStatus: 'success',
    })

    res.status(201).json({
      message: 'Purchase successful! You can now download this resource.',
      transaction,
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/transactions/my
const getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ buyerId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('resourceId', 'title category branch imageURL price')

    res.json({ transactions })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { purchaseResource, getMyTransactions }