import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Link,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

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
  registrationLink?: string;
  feedbackLink?: string;
  participants?: string[];
}

const EventDetails: React.FC = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [isParticipant, setIsParticipant] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5001/api/events/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEvent(response.data);
        
        // Check if user is a participant
        const userId = localStorage.getItem('userId');
        if (response.data.participants && response.data.participants.includes(userId)) {
          setIsParticipant(true);
        }

        // Get user role
        const role = localStorage.getItem('role');
        setUserRole(role);

        // If club manager, fetch participants
        if (role === 'clubManager') {
          const participantsResponse = await axios.get(
            `http://localhost:5001/api/events/${eventId}/participants`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setParticipants(participantsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const handleParticipation = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!isParticipant) {
        await axios.post(
          `http://localhost:5001/api/events/${eventId}/participate`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsParticipant(true);
      } else {
        await axios.delete(
          `http://localhost:5001/api/events/${eventId}/participate`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsParticipant(false);
      }
    } catch (error) {
      console.error('Error updating participation:', error);
    }
  };

  if (!event) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Navigation Bar */}
      <AppBar position="static" sx={{ bgcolor: '#001f3f' }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            iClub
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {/* Quick Access Links */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6">Quick Access Links</Typography>
              <List>
                <ListItem component="div" sx={{ cursor: 'pointer' }} onClick={() => navigate('/calendar')}>
                  <ListItemText primary="Calendar" />
                </ListItem>
                <ListItem component="div" sx={{ cursor: 'pointer' }} onClick={() => navigate('/clubs')}>
                  <ListItemText primary="Clubs" />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={9}>
            <Paper sx={{ p: 3, position: 'relative' }}>
              {/* Event Title and Date */}
              <Typography variant="h4" gutterBottom>
                {event.title}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                {new Date(event.date).toLocaleDateString('en-US', { 
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} at {event.time}
              </Typography>

              {/* Event Description */}
              <Box sx={{ my: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Event Description
                </Typography>
                <Typography paragraph>
                  {event.description}
                </Typography>
              </Box>

              {/* Location Information */}
              <Box sx={{ 
                my: 3,
                maxWidth: '400px'
              }}>
                <Typography variant="h6" gutterBottom>
                  Location Information
                </Typography>
                <Typography>
                  {event.location}
                </Typography>
              </Box>

              {/* Join Event Button - Shown for all users */}
              <Box sx={{ 
                mt: 4,
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '2rem'
              }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleParticipation}
                  sx={{
                    minWidth: '200px',
                    py: 1.5,
                    px: 3,
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    textTransform: 'none',
                    borderRadius: 1,
                    bgcolor: '#001f3f',
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: '#00284d',
                      boxShadow: 'none'
                    }
                  }}
                >
                  Join Event
                </Button>
              </Box>

              {/* Feedback Link */}
              {event.feedbackLink && (
                <Box sx={{ my: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Feedback
                  </Typography>
                  <Link href={event.feedbackLink} target="_blank" rel="noopener">
                    Provide Feedback
                  </Link>
                </Box>
              )}

              {/* Club Manager View - Participant List */}
              {userRole === 'clubManager' && (
                <Box sx={{ 
                  mt: 4,
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  p: 2
                }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    Participant List View
                  </Typography>
                  <List sx={{ 
                    width: '100%',
                    bgcolor: 'background.paper',
                    '& .MuiListItem-root': {
                      borderBottom: '1px solid #e0e0e0',
                      py: 1.5
                    },
                    '& .MuiListItem-root:last-child': {
                      borderBottom: 'none'
                    }
                  }}>
                    {participants.length > 0 ? (
                      participants.map((participant, index) => (
                        <ListItem key={index}>
                          <ListItemText 
                            primary={participant}
                            sx={{
                              '& .MuiTypography-root': {
                                fontSize: '0.9rem',
                                color: '#333'
                              }
                            }}
                          />
                        </ListItem>
                      ))
                    ) : (
                      <ListItem>
                        <ListItemText 
                          primary="No participants yet"
                          sx={{
                            '& .MuiTypography-root': {
                              fontSize: '0.9rem',
                              color: '#666',
                              fontStyle: 'italic'
                            }
                          }}
                        />
                      </ListItem>
                    )}
                  </List>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default EventDetails; 