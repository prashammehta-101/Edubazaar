const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Storage for digital files (PDF, PPT, DOC)
const fileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:        'eng-platform/files',
    resource_type: 'raw',
    allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'zip'],
  },
})

// Storage for images (thumbnails, covers)
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:        'eng-platform/images',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
})

module.exports = { cloudinary, fileStorage, imageStorage }