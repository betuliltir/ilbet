import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  AppBar,
  Toolbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Inter-Club
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome to your Dashboard
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              This is a protected route. You can only see this if you're logged in.
            </Typography>
            {user && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6">User Information:</Typography>
                <Typography>Name: {user.firstName} {user.lastName}</Typography>
                <Typography>Email: {user.email}</Typography>
                <Typography>User Type: {user.userType}</Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default Dashboard; 