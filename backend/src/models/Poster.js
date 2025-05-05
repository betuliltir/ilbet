const mongoose = require('mongoose');

const posterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  feedback: {
    type: String,
    default: ''
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Poster', posterSchema);