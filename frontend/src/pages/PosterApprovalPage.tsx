import React, { useEffect } from 'react';
import PosterApproval from '../components/PosterApproval';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const PosterApprovalPage: React.FC = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    console.log('PosterApprovalPage - User from context:', user);
    console.log('PosterApprovalPage - User type from context:', user?.userType);
    console.log('PosterApprovalPage - User role from context:', user?.role);
    console.log('PosterApprovalPage - User role from localStorage:', localStorage.getItem('userRole'));
    
    // Store the role in localStorage if user is a club manager
    if (user && user.userType === 'clubManager') {
      localStorage.setItem('userRole', 'clubManager');
    }
  }, [user]);

  // Check both the user object and localStorage for club manager status
  const isClubManager = 
    user?.userType === 'clubManager' || 
    user?.role === 'clubManager' || 
    localStorage.getItem('userRole') === 'clubManager';
  
  if (!user && !localStorage.getItem('token')) {
    console.log('PosterApprovalPage - No user or token found, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  if (!isClubManager) {
    console.log('PosterApprovalPage - Not a club manager, redirecting to home');
    return <Navigate to="/" replace />;
  }
  
  console.log('PosterApprovalPage - Rendering PosterApproval component');
  return <PosterApproval />;
};

export default PosterApprovalPage;