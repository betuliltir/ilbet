require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const eventRoutes = require('./routes/eventRoutes');
const authRoutes = require('./routes/authRoutes');
const clubRoutes = require('./routes/clubRoutes');
const userRoutes = require('./routes/userRoutes');
const posterRoutes = require('./routes/posterRoutes'); // Make sure this path is correct
const uploadRoutes = require('./routes/uploadRoutes'); // Make sure this path is correct

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Static files - make sure the path is correct for your project structure
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posters', posterRoutes);
app.use('/api/upload', uploadRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Make sure uploads directory exists - adjusted for your project structure
const fs = require('fs');
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created uploads directory');
}

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});