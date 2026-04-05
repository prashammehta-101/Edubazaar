const Resource    = require('../models/Resource.model')
const Transaction = require('../models/Transaction.model')

// GET /api/resources  — public, with filters + pagination
const getAllResources = async (req, res) => {
  try {
    const { branch, semester, category, type, search, sort, page = 1, limit = 12 } = req.query

    const filter = { approved: 'approved' }

    if (branch)   filter.branch   = branch
    if (semester) filter.semester = Number(semester)
    if (category) filter.category = category
    if (type === 'free') filter.price = 0
    if (type === 'paid') filter.price = { $gt: 0 }

    if (search) {
      filter.$text = { $search: search }
    }

    let sortOption = { createdAt: -1 }
    if (sort === 'price_asc')  sortOption = { price: 1 }
    if (sort === 'price_desc') sortOption = { price: -1 }
    if (sort === 'downloads')  sortOption = { downloads: -1 }
    if (sort === 'rating')     sortOption = { averageRating: -1 }

    const skip  = (Number(page) - 1) * Number(limit)
    const total = await Resource.countDocuments(filter)

    const resources = await Resource.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .populate('sellerId', 'name email branch')

    res.json({
      resources,
      currentPage: Number(page),
      totalPages:  Math.ceil(total / Number(limit)),
      totalCount:  total,
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/resources/:id  — public
const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('sellerId', 'name email branch college')

    if (!resource) return res.status(404).json({ message: 'Resource not found.' })
    if (resource.approved !== 'approved') return res.status(404).json({ message: 'Resource not available.' })

    res.json({ resource })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// POST /api/resources  — seller only
const createResource = async (req, res) => {
  try {
    const { title, description, branch, subject, semester, category, type, price, tags } = req.body

    const resourceData = {
      title, description, branch, subject,
      semester: Number(semester),
      category, type,
      price:    Number(price) || 0,
      tags:     tags ? tags.split(',').map(t => t.trim()) : [],
      sellerId: req.user._id,
    }

    if (req.files?.file)  resourceData.fileURL  = req.files.file[0].path
    if (req.files?.image) resourceData.imageURL = req.files.image[0].path

    const resource = await Resource.create(resourceData)
    res.status(201).json({ message: 'Resource uploaded. Pending admin approval.', resource })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// PUT /api/resources/:id  — seller (own only)
const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
    if (!resource) return res.status(404).json({ message: 'Resource not found.' })

    if (resource.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this resource.' })
    }

    const { title, description, branch, subject, semester, category, type, price, tags } = req.body

    const updates = {
      title, description, branch, subject,
      semester: Number(semester),
      category, type,
      price: Number(price) || 0,
      tags:  tags ? tags.split(',').map(t => t.trim()) : resource.tags,
      approved: 'pending', // re-approval needed after edit
    }

    if (req.files?.file)  updates.fileURL  = req.files.file[0].path
    if (req.files?.image) updates.imageURL = req.files.image[0].path

    const updated = await Resource.findByIdAndUpdate(req.params.id, updates, { new: true })
    res.json({ message: 'Resource updated. Pending re-approval.', resource: updated })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// DELETE /api/resources/:id  — seller (own only) or admin
const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
    if (!resource) return res.status(404).json({ message: 'Resource not found.' })

    const isOwner = resource.sellerId.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'admin'

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this resource.' })
    }

    await Resource.findByIdAndDelete(req.params.id)
    res.json({ message: 'Resource deleted successfully.' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/resources/my  — seller's own listings
const getMyResources = async (req, res) => {
  try {
    const resources = await Resource.find({ sellerId: req.user._id }).sort({ createdAt: -1 })
    res.json({ resources })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/resources/:id/download  — buyer (must have purchased)
const downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
    if (!resource) return res.status(404).json({ message: 'Resource not found.' })

    // Free resource — anyone can download
    if (resource.price === 0) {
      await Resource.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } })
      return res.json({ fileURL: resource.fileURL })
    }

    // Paid resource — check purchase
    const transaction = await Transaction.findOne({
      buyerId:       req.user._id,
      resourceId:    req.params.id,
      paymentStatus: 'success',
    })

    if (!transaction) {
      return res.status(403).json({ message: 'Purchase this resource to download.' })
    }

    await Resource.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } })
    res.json({ fileURL: resource.fileURL })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/resources/recommended  — by logged-in user's branch
const getRecommended = async (req, res) => {
  try {
    const resources = await Resource.find({
      branch:   req.user.branch,
      approved: 'approved',
    })
      .sort({ downloads: -1 })
      .limit(8)
      .populate('sellerId', 'name')

    res.json({ resources })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  getMyResources,
  downloadResource,
  getRecommended,
}