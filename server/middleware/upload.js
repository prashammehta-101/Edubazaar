const multer = require('multer')
const { fileStorage, imageStorage } = require('../config/cloudinary')

// Allowed MIME types for digital files
const fileFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'application/x-zip-compressed',
  ]
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Allowed: PDF, DOC, PPT, ZIP'), false)
  }
}

// Allowed MIME types for images
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed'), false)
  }
}

// Upload handlers
const uploadFile  = multer({ storage: fileStorage,  fileFilter, limits: { fileSize: 50 * 1024 * 1024 } })  // 50MB
const uploadImage = multer({ storage: imageStorage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } }) // 5MB

module.exports = { uploadFile, uploadImage }