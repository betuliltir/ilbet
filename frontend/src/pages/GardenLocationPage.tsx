import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  AppBar,
  Toolbar,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Fab,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CalendarToday as CalendarIcon,
  Group as GroupIcon,
  LocationOn as LocationIcon,
  EventNote as EventIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Location {
  id: number;
  x: number;
  y: number;
  label: string;
}

const GardenLocationPage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [locations, setLocations] = useState<Location[]>([
    { id: 1, x: 100, y: 100, label: "Main Stage" },
    { id: 2, x: 300, y: 150, label: "Food Court" },
    { id: 3, x: 500, y: 200, label: "Workshop Area" },
    { id: 4, x: 200, y: 300, label: "Rest Area" },
    { id: 5, x: 400, y: 350, label: "Information Desk" },
  ]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();

  const quickAccessLinks = [
    { text: 'Event Calendar', icon: <CalendarIcon />, path: '/calendar' },
    { text: 'Event Management', icon: <EventIcon />, path: '/events/manage' },
    { text: 'Club Membership', icon: <GroupIcon />, path: '/membership' },
    { text: 'Garden Location', icon: <LocationIcon />, path: '/garden-location' },
  ];

  const handleLocationClick = (location: Location) => {
    if (!isEditing) return;
    setSelectedLocation(location);
    setNewLabel(location.label);
    setIsDialogOpen(true);
  };

  const handleLabelChange = () => {
    if (!selectedLocation || !newLabel.trim()) return;
    setLocations(prevLocations =>
      prevLocations.map(loc =>
        loc.id === selectedLocation.id ? { ...loc, label: newLabel.trim() } : loc
      )
    );
    setIsDialogOpen(false);
    setSelectedLocation(null);
    setNewLabel('');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Garden Event Location Map
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, position: 'relative' }}>
        <Grid container spacing={3}>
          {/* Quick Access Links */}
          <Grid item xs={12} md={3}>
            <Paper 
              sx={{ 
                p: 2, 
                height: '100%',
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                Quick Access Links
              </Typography>
              <List>
                {quickAccessLinks.map((item) => (
                  <ListItem 
                    key={item.text} 
                    disablePadding
                    sx={{ mb: 1 }}
                  >
                    <ListItemButton
                      onClick={() => navigate(item.path)}
                      sx={{
                        borderRadius: 1,
                        '&:hover': {
                          bgcolor: 'primary.light',
                          '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                            color: 'primary.contrastText',
                          },
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text}
                        primaryTypographyProps={{
                          fontSize: '0.9rem',
                          fontWeight: 'medium',
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Map Content */}
          <Grid item xs={12} md={9}>
            <Box sx={{ position: 'relative' }}>
              <Paper 
                sx={{ 
                  p: 2,
                  position: 'relative',
                  width: '100%',
                  height: 600,
                  backgroundColor: '#fff',
                  overflow: 'hidden',
                  backgroundImage: 'linear-gradient(#e0e0e0 1px, transparent 1px), linear-gradient(90deg, #e0e0e0 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                  borderRadius: 2,
                  boxShadow: 1,
                }}
              >
                {/* UC Circle */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 50,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 200,
                    height: 100,
                    borderTopLeftRadius: 100,
                    borderTopRightRadius: 100,
                    bgcolor: '#e0e0e0',
                    border: '2px solid #ccc',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Typography>UC</Typography>
                </Box>

                {/* Location Markers */}
                <Grid container spacing={2} sx={{ height: '100%', position: 'relative' }}>
                  {locations.map((location) => (
                    <Box
                      key={location.id}
                      sx={{
                        position: 'absolute',
                        left: location.x,
                        top: location.y,
                        cursor: isEditing ? 'pointer' : 'default',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: isEditing ? 'scale(1.05)' : 'none',
                        },
                      }}
                      onClick={() => handleLocationClick(location)}
                    >
                      <Box
                        sx={{
                          bgcolor: 'background.paper',
                          border: 2,
                          borderColor: isEditing ? 'primary.main' : 'grey.300',
                          borderRadius: 1,
                          px: 2,
                          py: 1,
                          minWidth: 120,
                          textAlign: 'center',
                          boxShadow: isEditing ? 2 : 1,
                          '&:hover': {
                            borderColor: isEditing ? 'primary.dark' : 'grey.300',
                            bgcolor: isEditing ? 'primary.light' : 'background.paper',
                            color: isEditing ? 'primary.contrastText' : 'inherit',
                          },
                        }}
                      >
                        <Typography 
                          variant="body2"
                          sx={{
                            fontWeight: 'medium',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {location.label}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Grid>

                {/* Floating Edit Button */}
                {user?.role === 'clubManager' && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 24,
                      right: 24,
                      display: 'flex',
                      gap: 2,
                    }}
                  >
                    {isEditing ? (
                      <>
                        <Tooltip title="Save Changes">
                          <Fab
                            color="primary"
                            size="medium"
                            onClick={() => setIsEditing(false)}
                            sx={{ boxShadow: 3 }}
                          >
                            <SaveIcon />
                          </Fab>
                        </Tooltip>
                        <Tooltip title="Cancel Editing">
                          <Fab
                            color="error"
                            size="medium"
                            onClick={() => setIsEditing(false)}
                            sx={{ boxShadow: 3 }}
                          >
                            <CancelIcon />
                          </Fab>
                        </Tooltip>
                      </>
                    ) : (
                      <Tooltip title="Edit Locations">
                        <Fab
                          color="primary"
                          size="medium"
                          onClick={() => setIsEditing(true)}
                          sx={{ boxShadow: 3 }}
                        >
                          <EditIcon />
                        </Fab>
                      </Tooltip>
                    )}
                  </Box>
                )}
              </Paper>
            </Box>
          </Grid>
        </Grid>

        {/* Edit Label Dialog */}
        <Dialog 
          open={isDialogOpen} 
          onClose={() => setIsDialogOpen(false)}
          PaperProps={{
            sx: { minWidth: 300 }
          }}
        >
          <DialogTitle>Edit Location Label</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Location Label"
              fullWidth
              variant="outlined"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleLabelChange} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default GardenLocationPage; 