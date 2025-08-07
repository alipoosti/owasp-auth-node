import React, { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setOAuthToken } = useContext(AuthContext);

  useEffect(() => {
    // Parse token from URL query or fetch from backend callback endpoint
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      // Save token in context/localStorage
      setOAuthToken(token);
      // Redirect to profile page
      navigate('/profile');
    } else {
      // No token found, redirect to login
      navigate('/login');
    }
  }, [location, navigate, setOAuthToken]);

  return (
    <div style={containerStyle}>
      <h1>OAuth Login</h1>
      <p>Processing login...</p>
    </div>
  );
};

const containerStyle = {
  maxWidth: '600px',
  margin: '40px auto',
  padding: '20px',
  fontFamily: 'Arial, sans-serif',
  textAlign: 'center',
};

export default OAuthCallback;