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
const Event = require('../models/Event');
const User = require('../models/User');

// Public routes (require authentication only)
router.get('/', authenticate, getEvents);
router.get('/:id', authenticate, getEvent);

// Club manager routes
router.post('/', authenticate, authorize(['clubManager']), createEvent);
router.put('/:id', authenticate, authorize(['clubManager']), updateEvent);
router.delete('/:id', authenticate, authorize(['clubManager']), deleteEvent);

// Admin routes
router.patch('/:id/status', authenticate, authorize(['admin']), updateEventStatus);

// Get event details by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('club', 'name')
      .populate('participants', 'firstName lastName email');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error fetching event details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get event participants
router.get('/:id/participants', authenticate, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('participants', 'firstName lastName email');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event.participants);
  } catch (error) {
    console.error('Error fetching event participants:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Participate in an event
router.post('/:id/participate', authenticate, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is already a participant
    if (event.participants.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already participating in this event' });
    }

    event.participants.push(req.user.id);
    await event.save();

    res.json({ message: 'Successfully joined the event' });
  } catch (error) {
    console.error('Error participating in event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel participation in an event
router.delete('/:id/participate', authenticate, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Remove user from participants
    event.participants = event.participants.filter(
      participant => participant.toString() !== req.user.id
    );
    
    await event.save();

    res.json({ message: 'Successfully cancelled participation' });
  } catch (error) {
    console.error('Error cancelling participation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 