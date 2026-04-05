const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')

dotenv.config()
connectDB()

const app = express()

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth',         require('./routes/auth.routes'))
app.use('/api/resources',    require('./routes/resource.routes'))
app.use('/api/transactions', require('./routes/transaction.routes'))
app.use('/api/admin',        require('./routes/admin.routes'))
app.use('/api/reviews',      require('./routes/review.routes'))
app.use('/api/wishlist',     require('./routes/wishlist.routes'))

// Health check
app.get('/', (req, res) => res.json({ message: 'Engineering Platform API running' }))

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Something went wrong', error: err.message })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))