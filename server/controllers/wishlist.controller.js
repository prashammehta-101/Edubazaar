const Wishlist = require('../models/Wishlist.model')

// POST /api/wishlist/:resourceId  — toggle
const toggleWishlist = async (req, res) => {
  try {
    const { resourceId } = req.params

    let wishlist = await Wishlist.findOne({ userId: req.user._id })

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user._id, resources: [resourceId] })
      return res.json({ message: 'Added to wishlist.', wishlist })
    }

    const index = wishlist.resources.indexOf(resourceId)

    if (index > -1) {
      wishlist.resources.splice(index, 1)
      await wishlist.save()
      return res.json({ message: 'Removed from wishlist.', wishlist })
    } else {
      wishlist.resources.push(resourceId)
      await wishlist.save()
      return res.json({ message: 'Added to wishlist.', wishlist })
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/wishlist
const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id })
      .populate('resources', 'title category branch price imageURL averageRating approved')

    res.json({ wishlist: wishlist || { resources: [] } })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { toggleWishlist, getWishlist }