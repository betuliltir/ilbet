import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Rating,
  Alert,
  Grid,
  Divider,
  Chip,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupIcon from '@mui/icons-material/Group';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  club: {
    _id: string;
    name: string;
  };
  participants: string[];
}

const FeedbackPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5001/api/events/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEvent(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load event details');
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      setError('Please provide a rating');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5001/api/events/${eventId}/feedback`, {
        rating,
        comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(true);
      setTimeout(() => {
        navigate(`/events/${eventId}`);
      }, 2000);
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading event details...</Typography>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">Event not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Event Details Card */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom color="primary">
          {event.title}
        </Typography>
        
        <Box sx={{ my: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={<CalendarTodayIcon />}
            label={`${event.date} at ${event.time}`}
            variant="outlined"
          />
          <Chip
            icon={<LocationOnIcon />}
            label={event.location}
            variant="outlined"
          />
          <Chip
            icon={<GroupIcon />}
            label={`${event.participants.length} participants`}
            variant="outlined"
          />
        </Box>

        <Typography variant="body1" paragraph>
          {event.description}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle1" color="text.secondary">
          Organized by: {event.club.name}
        </Typography>
      </Paper>

      {/* Feedback Form */}
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Event Feedback
        </Typography>

        {success ? (
          <Alert severity="success" sx={{ mt: 2 }}>
            Thank you for your feedback! Redirecting...
          </Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                <Typography component="legend" gutterBottom>
                  How would you rate this event?
                </Typography>
                <Rating
                  value={rating}
                  onChange={(_, value) => {
                    setRating(value);
                    setError('');
                  }}
                  size="large"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Share your thoughts about the event"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/events/${eventId}`)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!rating}
                  >
                    Submit Feedback
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        )}
      </Paper>
    </Container>
  );
};

export default FeedbackPage; 