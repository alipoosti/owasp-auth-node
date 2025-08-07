import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/authService';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await register(formData);
      setSuccess('Registration successful! You can now login.');
      setFormData({ username: '', password: '' });
      // Optionally redirect to login page after registration
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>Register Page</h1>
      <form onSubmit={handleSubmit} style={formStyle}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>Register</button>
      </form>
      <GoogleLoginButton />
      {error && <p style={errorStyle}>{error}</p>}
      {success && <p style={successStyle}>{success}</p>}
      <div style={{ marginTop: '20px' }}>
        <Link to="/" style={backLinkStyle}>Back to Home</Link>
      </div>
    </div>
  );
};

// Google OAuth login button component
const GoogleLoginButton = () => {
  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000'}/api/auth/oauth/google`;
  };

  return (
    <button onClick={handleGoogleLogin} style={googleButtonStyle}>
      Continue with Google
    </button>
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

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
  marginBottom: '20px',
};

const inputStyle = {
  padding: '10px',
  fontSize: '16px',
  borderRadius: '4px',
  border: '1px solid #ccc',
};

const buttonStyle = {
  padding: '12px',
  fontSize: '16px',
  color: '#fff',
  backgroundColor: '#007bff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

const googleButtonStyle = {
  padding: '12px',
  fontSize: '16px',
  color: '#fff',
  backgroundColor: '#db4437',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  marginTop: '10px',
};

const errorStyle = {
  color: 'red',
  marginBottom: '10px',
};

const successStyle = {
  color: 'green',
  marginBottom: '10px',
};

const backLinkStyle = {
  display: 'inline-block',
  marginTop: '10px',
  color: '#007bff',
  textDecoration: 'none',
};

export default Register;