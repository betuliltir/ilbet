import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  SelectChangeEvent,
  AppBar,
  Toolbar,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  TextField,
  ButtonGroup,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { 
  CalendarToday, 
  Group, 
  Feedback, 
  CheckCircle as ApprovedIcon,
  Pending as PendingIcon,
  ChangeCircle as ChangesRequestedIcon,
  Menu as MenuIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
} from '@mui/icons-material';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  status: 'pending' | 'approved' | 'changes_requested';
  extendedProps: {
    description: string;
    location: string;
    time: string;
    club: {
      _id: string;
      name: string;
    };
    eventType: string;
    registrationLink: string;
    feedbackLink?: string;
    approvalStatus: string;
    approvalNotes?: string;
  };
}

interface Club {
  _id: string;
  name: string;
}

const AdminCalendar: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('');
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState('');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [viewMode, setViewMode] = useState<'dayGridMonth' | 'dayGridWeek'>('dayGridMonth');
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());

  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const quickAccessLinks = [
    { text: 'Event Calendar', icon: <CalendarToday />, path: '/admin/calendar' },
    { text: 'Club Management', icon: <Group />, path: '/admin/clubs' },
    { text: 'Feedback Overview', icon: <Feedback />, path: '/admin/feedback' },
  ];

  const fetchClubs = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/clubs', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setClubs(response.data);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      let url = 'http://localhost:5001/api/events?';
      const params = new URLSearchParams();

      if (selectedClub) params.append('club', selectedClub);
      if (selectedEventType) params.append('eventType', selectedEventType);
      if (selectedApprovalStatus) params.append('status', selectedApprovalStatus);
      if (startDate) params.append('startDate', startDate.format('YYYY-MM-DD'));
      if (endDate) params.append('endDate', endDate.format('YYYY-MM-DD'));

      const response = await axios.get(url + params.toString(), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }, [selectedClub, selectedEventType, selectedApprovalStatus, startDate, endDate]);

  useEffect(() => {
    fetchClubs();
    fetchEvents();
  }, [fetchClubs, fetchEvents]);

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event);
    setApprovalNotes(info.event.extendedProps.approvalNotes || '');
    setIsDialogOpen(true);
  };

  const handleUpdateEventStatus = async (status: 'approved' | 'changes_requested') => {
    if (!selectedEvent) return;

    try {
      await axios.patch(
        `http://localhost:5001/api/events/${selectedEvent.id}/status`,
        {
          status,
          approvalNotes
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setIsDialogOpen(false);
      fetchEvents();
    } catch (error) {
      console.error('Error updating event status:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <ApprovedIcon color="success" />;
      case 'pending':
        return <PendingIcon color="warning" />;
      case 'changes_requested':
        return <ChangesRequestedIcon color="error" />;
      default:
        return null;
    }
  };

  const handleClubChange = (event: SelectChangeEvent) => {
    setSelectedClub(event.target.value);
  };

  const handleEventTypeChange = (event: SelectChangeEvent) => {
    setSelectedEventType(event.target.value);
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    setSelectedApprovalStatus(event.target.value);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedEvent(null);
    setApprovalNotes('');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const eventTypes = [
    'academic',
    'social',
    'sports',
    'cultural',
    'other'
  ];

  const handleResetFilters = () => {
    setSelectedClub('');
    setSelectedEventType('');
    setSelectedApprovalStatus('');
    setStartDate(null);
    setEndDate(null);
  };

  const navigateToToday = () => {
    setCurrentDate(dayjs());
  };

  const navigatePrevious = () => {
    setCurrentDate(currentDate.subtract(1, viewMode === 'dayGridMonth' ? 'month' : 'week'));
  };

  const navigateNext = () => {
    setCurrentDate(currentDate.add(1, viewMode === 'dayGridMonth' ? 'month' : 'week'));
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
            Club Event Calendar - Admin View
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body1">
              Welcome, {user?.firstName} {user?.lastName}
            </Typography>
            <Button variant="outlined" color="primary" onClick={handleLogout}>
              Logout
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Quick Access Links */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Quick Access Links
              </Typography>
              <List>
                {quickAccessLinks.map((item) => (
                  <ListItem
                    key={item.text}
                    component="div"
                    onClick={() => navigate(item.path)}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'primary.light',
                        color: 'primary.contrastText',
                      },
                    }}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Calendar and Filters */}
          <Grid item xs={12} md={9}>
            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Stack spacing={2}>
                <Typography variant="h6" gutterBottom>
                  Filters
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Select Club</InputLabel>
                      <Select
                        value={selectedClub}
                        label="Select Club"
                        onChange={handleClubChange}
                      >
                        <MenuItem value="">All Clubs</MenuItem>
                        {clubs.map((club) => (
                          <MenuItem key={club._id} value={club._id}>
                            {club.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Event Type</InputLabel>
                      <Select
                        value={selectedEventType}
                        label="Event Type"
                        onChange={handleEventTypeChange}
                      >
                        <MenuItem value="">All Types</MenuItem>
                        {eventTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Approval Status</InputLabel>
                      <Select
                        value={selectedApprovalStatus}
                        label="Approval Status"
                        onChange={handleStatusChange}
                      >
                        <MenuItem value="">All Status</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="approved">Approved</MenuItem>
                        <MenuItem value="changes_requested">Changes Requested</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Start Date"
                        value={startDate}
                        onChange={(newValue) => setStartDate(newValue)}
                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="End Date"
                        value={endDate}
                        onChange={(newValue) => setEndDate(newValue)}
                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleResetFilters}
                    >
                      Reset Filters
                    </Button>
                  </Grid>
                </Grid>
              </Stack>
            </Paper>

            {/* Calendar */}
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <IconButton onClick={navigatePrevious}>&lt;</IconButton>
                  <IconButton onClick={navigateNext}>&gt;</IconButton>
                  <Button onClick={navigateToToday}>today</Button>
                </Box>
                <Typography variant="h5">
                  {currentDate.format('MMMM YYYY')}
                </Typography>
                <Box>
                  <Button
                    variant={viewMode === 'dayGridMonth' ? 'contained' : 'outlined'}
                    onClick={() => setViewMode('dayGridMonth')}
                    sx={{ mr: 1 }}
                  >
                    month
                  </Button>
                  <Button
                    variant={viewMode === 'dayGridWeek' ? 'contained' : 'outlined'}
                    onClick={() => setViewMode('dayGridWeek')}
                  >
                    week
                  </Button>
                </Box>
              </Box>
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView={viewMode}
                events={events}
                eventClick={handleEventClick}
                eventContent={(arg) => {
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {getStatusIcon(arg.event.extendedProps.approvalStatus)}
                      <span>{arg.event.title}</span>
                    </Box>
                  );
                }}
                headerToolbar={false}
                height="auto"
              />
            </Paper>
          </Grid>
        </Grid>

        {/* Event Details Dialog */}
        <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          {selectedEvent && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6">{selectedEvent.title}</Typography>
                  <Box>
                    {getStatusIcon(selectedEvent.extendedProps.approvalStatus)}
                  </Box>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Stack spacing={2}>
                  <Typography variant="body1">
                    <strong>Club:</strong>{' '}
                    {selectedEvent.extendedProps.club.name}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Date:</strong>{' '}
                    {new Date(selectedEvent.start).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Time:</strong> {selectedEvent.extendedProps.time}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Location:</strong> {selectedEvent.extendedProps.location}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Event Type:</strong>{' '}
                    {selectedEvent.extendedProps.eventType.charAt(0).toUpperCase() +
                      selectedEvent.extendedProps.eventType.slice(1)}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Description:</strong>
                    <br />
                    {selectedEvent.extendedProps.description}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Current Status:</strong>{' '}
                    {selectedEvent.extendedProps.approvalStatus.charAt(0).toUpperCase() +
                      selectedEvent.extendedProps.approvalStatus.slice(1).replace('_', ' ')}
                  </Typography>
                  <TextField
                    label="Approval Notes"
                    multiline
                    rows={4}
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    fullWidth
                  />
                </Stack>
              </DialogContent>
              <DialogActions>
                <ButtonGroup variant="contained">
                  <Button
                    startIcon={<ApproveIcon />}
                    color="success"
                    onClick={() => handleUpdateEventStatus('approved')}
                  >
                    Approve
                  </Button>
                  <Button
                    startIcon={<RejectIcon />}
                    color="error"
                    onClick={() => handleUpdateEventStatus('changes_requested')}
                  >
                    Request Changes
                  </Button>
                </ButtonGroup>
                <Button onClick={handleCloseDialog}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </Box>
  );
};

export default AdminCalendar; 