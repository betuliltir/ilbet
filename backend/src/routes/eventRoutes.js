const express = require('express');
const router = express.Router();
const { 
  getEvents, 
  getEvent, 
  createEvent, 
  updateEvent, 
  deleteEvent, 
  updateEventStatus 
} = require('../controllers/eventController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// Public routes (require authentication only)
router.get('/', authenticate, getEvents);
router.get('/:id', authenticate, getEvent);

// Club manager routes
router.post('/', authenticate, authorize(['clubManager']), createEvent);
router.put('/:id', authenticate, authorize(['clubManager']), updateEvent);
router.delete('/:id', authenticate, authorize(['clubManager']), deleteEvent);

// Admin routes
router.patch('/:id/status', authenticate, authorize(['admin']), updateEventStatus);

module.exports = router; 