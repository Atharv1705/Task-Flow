import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register({ setIsAuth }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    try {
      const res = await axios.post('/api/auth/register', { username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      setSuccess('Registration successful! Redirecting to tasks...');
      setTimeout(() => navigate('/tasks'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input className="input" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <input className="input" type="password" placeholder="Confirm Password" value={confirm} onChange={e => setConfirm(e.target.value)} />
        <button className="btn primary" type="submit">Sign Up</button>
      </form>
      <div className="auth-footer">Already have an account? <Link to="/login">Sign In</Link></div>
      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}
    </div>
  );
}
