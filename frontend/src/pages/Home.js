import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'Arial, sans-serif', textAlign: 'center', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>Welcome to the Secure Node.js User Auth App</h1>
      <p style={{ fontSize: '18px', color: '#555', marginBottom: '30px' }}>
        Please use the buttons below to register, login, or view your profile.
      </p>
      <nav>
        <Link to="/register" style={buttonStyle}>Register</Link>
        <Link to="/login" style={buttonStyle}>Login</Link>
        <Link to="/profile" style={buttonStyle}>Profile</Link>
      </nav>
    </div>
  );
};

const buttonStyle = {
  display: 'inline-block',
  margin: '0 10px',
  padding: '12px 24px',
  fontSize: '16px',
  color: '#fff',
  backgroundColor: '#007bff',
  borderRadius: '4px',
  textDecoration: 'none',
  boxShadow: '0 2px 4px rgba(0,123,255,0.4)',
  transition: 'background-color 0.3s ease',
};

export default Home;