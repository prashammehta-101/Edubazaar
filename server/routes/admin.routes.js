const express = require('express')
const router  = express.Router()
const verifyToken = require('../middleware/verifyToken')
const roleGuard   = require('../middleware/roleGuard')
const {
  getPendingResources,
  approveResource,
  rejectResource,
  getAllUsers,
  changeUserRole,
  suspendUser,
  getAllTransactions,
  getStats,
} = require('../controllers/admin.controller')

router.use(verifyToken, roleGuard('admin')) // applies to ALL routes below

router.get('/resources/pending',          getPendingResources)
router.patch('/resources/:id/approve',    approveResource)
router.patch('/resources/:id/reject',     rejectResource)
router.get('/users',                      getAllUsers)
router.patch('/users/:id/role',           changeUserRole)
router.patch('/users/:id/suspend',        suspendUser)
router.get('/transactions',               getAllTransactions)
router.get('/stats',                      getStats)

module.exports = router