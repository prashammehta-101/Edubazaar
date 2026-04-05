const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
    default: '',
  },
}, { timestamps: true })

// One review per user per resource
reviewSchema.index({ resourceId: 1, userId: 1 }, { unique: true })

module.exports = mongoose.model('Review', reviewSchema)