const mongoose = require('mongoose')

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  branch: {
    type: String,
    required: true,
    enum: ['CS', 'IT', 'Mechanical', 'Civil', 'Electrical', 'Electronics', 'Chemical', 'Aerospace', 'Biotechnology', 'Other'],
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8,
  },
  category: {
    type: String,
    required: true,
    enum: ['Notes', 'PYQs', 'Lab Manuals', 'Mini Projects', 'CAD Files', 'Drawing Kits', 'Books', 'Coding Resources'],
  },
  type: {
    type: String,
    enum: ['digital', 'physical'],
    default: 'digital',
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  fileURL: {
    type: String,
    default: '',
  },
  imageURL: {
    type: String,
    default: '',
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  approved: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  tags: {
    type: [String],
    default: [],
  },
  downloads: {
    type: Number,
    default: 0,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
}, { timestamps: true })

// Text index for keyword search
resourceSchema.index({ title: 'text', subject: 'text', description: 'text', tags: 'text' })

module.exports = mongoose.model('Resource', resourceSchema)