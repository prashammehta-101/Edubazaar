const mongoose = require('mongoose')

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  resources: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
  }],
}, { timestamps: true })

module.exports = mongoose.model('Wishlist', wishlistSchema)