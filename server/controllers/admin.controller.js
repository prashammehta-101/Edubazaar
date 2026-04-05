const Resource    = require('../models/Resource.model')
const User        = require('../models/User.model')
const Transaction = require('../models/Transaction.model')

// GET /api/admin/resources/pending
const getPendingResources = async (req, res) => {
  try {
    const resources = await Resource.find({ approved: 'pending' })
      .sort({ createdAt: -1 })
      .populate('sellerId', 'name email branch')

    res.json({ resources })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// PATCH /api/admin/resources/:id/approve
const approveResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { approved: 'approved' },
      { new: true }
    )
    if (!resource) return res.status(404).json({ message: 'Resource not found.' })
    res.json({ message: 'Resource approved.', resource })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// PATCH /api/admin/resources/:id/reject
const rejectResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { approved: 'rejected' },
      { new: true }
    )
    if (!resource) return res.status(404).json({ message: 'Resource not found.' })
    res.json({ message: 'Resource rejected.', resource })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 })
    res.json({ users })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// PATCH /api/admin/users/:id/role
const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body
    if (!['buyer', 'seller', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' })
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true })
    if (!user) return res.status(404).json({ message: 'User not found.' })

    res.json({ message: `Role updated to ${role}`, user })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// PATCH /api/admin/users/:id/suspend
const suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found.' })

    user.isActive = !user.isActive
    await user.save()

    res.json({ message: `User ${user.isActive ? 'activated' : 'suspended'}.`, user })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/admin/transactions
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .populate('buyerId',    'name email')
      .populate('resourceId', 'title price category')

    res.json({ transactions })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalResources, totalTransactions, pendingResources] = await Promise.all([
      User.countDocuments(),
      Resource.countDocuments({ approved: 'approved' }),
      Transaction.countDocuments({ paymentStatus: 'success' }),
      Resource.countDocuments({ approved: 'pending' }),
    ])

    const revenueData = await Transaction.aggregate([
      { $match: { paymentStatus: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ])

    res.json({
      totalUsers,
      totalResources,
      totalTransactions,
      pendingResources,
      totalRevenue: revenueData[0]?.total || 0,
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = {
  getPendingResources,
  approveResource,
  rejectResource,
  getAllUsers,
  changeUserRole,
  suspendUser,
  getAllTransactions,
  getStats,
}