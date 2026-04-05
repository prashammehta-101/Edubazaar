const express = require('express')
const router  = express.Router()
const verifyToken = require('../middleware/verifyToken')
const { purchaseResource, getMyTransactions } = require('../controllers/transaction.controller')

router.post('/purchase', verifyToken, purchaseResource)
router.get('/my',        verifyToken, getMyTransactions)

module.exports = router