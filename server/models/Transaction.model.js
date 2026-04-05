const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'success',
  },
  transactionRef: {
    type: String,
    default: () => 'TXN' + Date.now() + Math.floor(Math.random() * 10000),
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true })

module.exports = mongoose.model('Transaction', transactionSchema)