const Event = require('../models/Event');
const User = require('../models/User');

// Submit feedback for an event
exports.submitFeedback = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is a participant
    if (!event.participants.includes(userId)) {
      return res.status(403).json({ message: 'Only participants can submit feedback' });
    }

    // Check if user has already submitted feedback
    if (event.feedback && event.feedback.some(fb => fb.user.toString() === userId)) {
      return res.status(400).json({ message: 'You have already submitted feedback for this event' });
    }

    // Add feedback
    const feedback = {
      user: userId,
      rating,
      comment,
      createdAt: new Date()
    };

    event.feedback = event.feedback || [];
    event.feedback.push(feedback);
    await event.save();

    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Error submitting feedback' });
  }
};

// Get feedback for an event
exports.getEventFeedback = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId)
      .populate('feedback.user', 'firstName lastName');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event.feedback || []);
  } catch (error) {
    console.error('Error getting feedback:', error);
    res.status(500).json({ message: 'Error getting feedback' });
  }
}; 