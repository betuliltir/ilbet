import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PosterApproval.css';

// Define interfaces for our data types
interface Club {
  _id: string;
  name: string;
}

interface Poster {
  _id: string;
  title: string;
  imageUrl: string;
  club: string;
  submittedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback: string;
  createdAt: string;
  updatedAt: string;
}

const PosterApproval: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [posters, setPosters] = useState<Poster[]>([]);
  const [club, setClub] = useState<Club | null>(null);
  
  const navigate = useNavigate();
  
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  // Set default header
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  useEffect(() => {
    // Check if user is logged in
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Store role information in localStorage
    localStorage.setItem('userRole', 'clubManager');
    
    // Get user details and club info
    const getUserAndClub = async () => {
      try {
        // Use the full URL with the port
        const userRes = await axios.get('http://localhost:5001/api/auth/me');
        console.log('User data:', userRes.data);
        
        // Check role from the response
        const isClubManager = 
          userRes.data.userType === 'clubManager' || 
          userRes.data.role === 'clubManager';
        
        if (!isClubManager) {
          console.log('Not a club manager, redirecting');
          navigate('/');
          return;
        }
        
        // If user has a club directly in the user object
        if (userRes.data.club) {
          try {
            const clubRes = await axios.get(`http://localhost:5001/api/clubs/${userRes.data.club}`);
            console.log('Club data from user:', clubRes.data);
            setClub(clubRes.data);
            
            // Get posters for this club
            try {
              const postersRes = await axios.get(`http://localhost:5001/api/posters/club/${userRes.data.club}`);
              setPosters(postersRes.data);
            } catch (posterError) {
              console.log('No posters found or endpoint not available yet');
              // This is expected if the endpoint isn't implemented yet
              setPosters([]);
            }
          } catch (clubError) {
            console.error('Error fetching club data:', clubError);
            setError('Failed to load club data. Please try again.');
          }
          return;
        }
        
        // Try to get managed clubs if the direct club is not available
        try {
          const clubsRes = await axios.get('http://localhost:5001/api/clubs/managed');
          console.log('Managed clubs data:', clubsRes.data);
          
          if (clubsRes.data.length === 0) {
            setError('You do not manage any clubs');
            return;
          }
          
          setClub(clubsRes.data[0]);
          
          // Get posters for this club
          try {
            const postersRes = await axios.get(`http://localhost:5001/api/posters/club/${clubsRes.data[0]._id}`);
            setPosters(postersRes.data);
          } catch (posterError) {
            console.log('No posters found or endpoint not available yet');
            // This is expected if the endpoint isn't implemented yet
            setPosters([]);
          }
        } catch (clubsError) {
          console.error('Error fetching managed clubs:', clubsError);
          setError('Failed to load club data. Please try again.');
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      }
    };
    
    getUserAndClub();
  }, [token, navigate]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setImage(files[0]);
      setImagePreview(URL.createObjectURL(files[0]));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !image || !club) {
      setError('Please provide a title and image');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      // First upload the image
      const formData = new FormData();
      formData.append('image', image);
      
      const uploadRes = await axios.post('http://localhost:5001/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Then create the poster with the image URL
      const posterRes = await axios.post('http://localhost:5001/api/posters', {
        title,
        imageUrl: uploadRes.data.filePath,
        clubId: club._id
      });
      
      // Add the new poster to the list
      setPosters([posterRes.data.poster, ...posters]);
      
      // Reset form
      setTitle('');
      setImage(null);
      setImagePreview(null);
      setSuccess('Poster submitted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
    } catch (err) {
      console.error('Error submitting poster:', err);
      setError('Failed to submit poster. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <div className="poster-approval-container">
      <div className="poster-approval-sidebar">
        <h3>Quick Access Links</h3>
        <ul>
          <li onClick={() => navigate('/manager/calendar')}>Event Calendar</li>
          <li onClick={() => navigate('/events/manage')}>Manage Events</li>
          <li onClick={() => navigate('/membership')}>Club Membership</li>
          <li onClick={() => navigate('/garden-location')}>Garden Event Location</li>
          <li className="active">Poster Approval</li>
        </ul>
      </div>
      
      <div className="poster-approval-content">
        <h2>Poster Submission</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit} className="poster-form">
          <div className="form-group">
            <label>Poster Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter poster title"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Upload Poster Image</label>
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              required
            />
            
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>
          
          <button
            type="submit"
            className="submit-button"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Poster'}
          </button>
        </form>
        
        <div className="submissions-section">
          <h3>Last Submissions Status</h3>
          
          {posters.length === 0 ? (
            <p>No posters submitted yet.</p>
          ) : (
            <div className="posters-list">
              {posters.map(poster => (
                <div key={poster._id} className="poster-item">
                  <div className="poster-thumbnail">
                    <img src={poster.imageUrl} alt={poster.title} />
                  </div>
                  <div className="poster-details">
                    <h4>{poster.title}</h4>
                    <p>Submitted: {formatDate(poster.createdAt)}</p>
                    <div className={`status-badge ${poster.status}`}>
                      {poster.status.charAt(0).toUpperCase() + poster.status.slice(1)}
                    </div>
                    {poster.feedback && (
                      <div className="feedback">
                        <strong>Feedback:</strong> {poster.feedback}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PosterApproval;