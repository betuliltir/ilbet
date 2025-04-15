const express = require('express');
const router = express.Router();
const { 
  getEvents, 
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

// Get event details by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('club', 'name')
      .populate('participants', 'firstName lastName email')
      .populate('feedback.user', 'firstName lastName email');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error fetching event details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Club manager routes
router.post('/', authenticate, authorize(['clubManager']), createEvent);
router.put('/:id', authenticate, authorize(['clubManager']), updateEvent);
router.delete('/:id', authenticate, authorize(['clubManager']), deleteEvent);

// Admin routes
router.patch('/:id/status', authenticate, authorize(['admin']), updateEventStatus);

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

// Join an event
router.post('/:id/participants', authenticate, async (req, res) => {
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

// Leave an event
router.delete('/:id/participants', authenticate, async (req, res) => {
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

    res.json({ message: 'Successfully left the event' });
  } catch (error) {
    console.error('Error leaving event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add feedback for an event
router.post('/:id/feedback', authenticate, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is a participant
    if (!event.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Only participants can submit feedback' });
    }

    // Check if user has already submitted feedback
    if (event.feedback && event.feedback.some(f => f.user.toString() === req.user.id)) {
      return res.status(400).json({ message: 'You have already submitted feedback for this event' });
    }

    // Create feedback object
    const feedback = {
      user: req.user.id,
      rating: req.body.rating,
      comment: req.body.comment,
      createdAt: new Date()
    };

    // Add feedback to event
    if (!event.feedback) {
      event.feedback = [];
    }
    event.feedback.push(feedback);
    await event.save();

    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 