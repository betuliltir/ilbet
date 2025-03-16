const Event = require('../models/Event');

// Get all events with filters
const getEvents = async (req, res) => {
  try {
    const query = {};
    
    // Apply filters
    if (req.query.club) query.club = req.query.club;
    if (req.query.eventType) query.eventType = req.query.eventType;
    if (req.query.status) query.status = req.query.status;
    
    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      query.date = {};
      if (req.query.startDate) query.date.$gte = new Date(req.query.startDate);
      if (req.query.endDate) query.date.$lte = new Date(req.query.endDate);
    }

    // For club managers, only show their club's events
    if (req.user.role === 'clubManager') {
      query.club = req.user.club;
    }

    const events = await Event.find(query)
      .populate('club', 'name')
      .populate('createdBy', 'firstName lastName')
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
};

// Create new event
const createEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      createdBy: req.user._id,
      status: 'pending'
    };

    const event = new Event(eventData);
    await event.save();

    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: 'Error creating event', error: error.message });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Only allow club managers to edit their own club's events
    if (req.user.role === 'clubManager' && event.club.toString() !== req.user.club.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this event' });
    }

    // If changes are made to an approved event, set status back to pending
    if (event.status === 'approved' && req.user.role === 'clubManager') {
      req.body.status = 'pending';
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: 'Error updating event', error: error.message });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Only allow club managers to delete their own club's events
    if (req.user.role === 'clubManager' && event.club.toString() !== req.user.club.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await event.remove();
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting event', error: error.message });
  }
};

// Get single event
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('club', 'name')
      .populate('createdBy', 'firstName lastName');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching event', error: error.message });
  }
};

// Update event status (for admin)
const updateEventStatus = async (req, res) => {
  try {
    const { status, approvalNotes } = req.body;

    if (!['pending', 'approved', 'changes_requested'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        approvalNotes,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(400).json({ message: 'Error updating event status', error: error.message });
  }
};

module.exports = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEvent,
  updateEventStatus
}; 