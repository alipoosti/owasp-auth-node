import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getProfile } from '../services/authService';
import { AuthContext } from '../contexts/AuthContext';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const { token, user } = useContext(AuthContext);

  useEffect(() => {
    if (!token) {
      // Instead of redirecting, show not logged in message and buttons
      setProfile(null);
      setError('');
      return;
    }
    const fetchProfile = async () => {
      try {
        const data = await getProfile(token);
        setProfile(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchProfile();
  }, [token]);

  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>Profile Page</h1>
      {error && <p style={errorStyle}>{error}</p>}
      {user ? (
        <div style={profileInfoStyle}>
          <p><strong>Name:</strong> {user.displayName || user.username}</p>
          {/* Removed email display as per requirements */}
          {/* Add more profile fields and edit functionality as needed */}
        </div>
      ) : (
        !error && (
          <div>
            <p>You are not logged in.</p>
            <button onClick={() => window.location.href = '/login'} style={buttonStyle}>Go to Login</button>
          </div>
        )
      )}
      {user && <button onClick={handleLogout} style={buttonStyle}>Logout</button>}
      <br />
      <Link to="/" style={backLinkStyle}>Back to Home</Link>
    </div>
  );
};

const containerStyle = {
  maxWidth: '600px',
  margin: '40px auto',
  padding: '20px',
  fontFamily: 'Arial, sans-serif',
  textAlign: 'center',
  border: '1px solid #ddd',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
};

const headerStyle = {
  color: '#333',
  marginBottom: '20px',
};

const profileInfoStyle = {
  fontSize: '18px',
  color: '#555',
  marginBottom: '30px',
  textAlign: 'left',
};

const buttonStyle = {
  padding: '12px',
  fontSize: '16px',
  color: '#fff',
  backgroundColor: '#007bff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  margin: '5px',
};

const errorStyle = {
  color: 'red',
  marginBottom: '10px',
};

const backLinkStyle = {
  display: 'inline-block',
  marginTop: '10px',
  color: '#007bff',
  textDecoration: 'none',
};

export default Profile;