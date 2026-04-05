const express = require('express')
const router  = express.Router()
const multer  = require('multer')
const { uploadFile, uploadImage } = require('../middleware/upload')
const verifyToken = require('../middleware/verifyToken')
const roleGuard   = require('../middleware/roleGuard')
const {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  getMyResources,
  downloadResource,
  getRecommended,
} = require('../controllers/resource.controller')

// Multi-field upload handler (file + image in one request)
const uploadFields = uploadFile.fields([
  { name: 'file',  maxCount: 1 },
  { name: 'image', maxCount: 1 },
])

// Public routes
router.get('/',             getAllResources)
router.get('/recommended',  verifyToken, getRecommended)
router.get('/my',           verifyToken, roleGuard('seller'), getMyResources)
router.get('/:id',          getResourceById)
router.get('/:id/download', verifyToken, downloadResource)

// Seller routes
router.post('/',    verifyToken, roleGuard('seller'), uploadFields, createResource)
router.put('/:id',  verifyToken, roleGuard('seller', 'admin'), uploadFields, updateResource)
router.delete('/:id', verifyToken, deleteResource)

module.exports = router