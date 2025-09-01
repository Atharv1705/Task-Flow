import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Login({ setIsAuth }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      setIsAuth(true);
      navigate('/tasks');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign In</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input className="input" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="btn primary" type="submit">Sign In</button>
      </form>
      <div className="auth-footer">Don't have an account? <Link to="/register">Sign Up</Link></div>
      {error && <div className="error-msg">{error}</div>}
    </div>
  );
}
