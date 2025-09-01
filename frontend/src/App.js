import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Tasks from './pages/Tasks';


function Toast({ message, type, onClose }) {
  if (!message) return null;
  
  // New color scheme avoiding green, red, blue, yellow
  const getToastColors = (type) => {
    switch(type) {
      case 'error':
        return '#e91e63'; // Pink/Magenta
      case 'success':
        return '#9c27b0'; // Purple
      case 'warning':
        return '#ff9800'; // Orange
      case 'info':
        return '#00bcd4'; // Cyan/Teal
      default:
        return '#6a1b9a'; // Deep Purple
    }
  };

  return (
    <div style={{position:'fixed',top:24,right:24,zIndex:9999,background:getToastColors(type),color:'#fff',padding:'1rem 2rem',borderRadius:12,boxShadow:'0 2px 16px #0004',fontWeight:600,letterSpacing:1,transition:'all 0.3s'}}>
      {message}
      <button onClick={onClose} style={{marginLeft:18,background:'none',border:'none',color:'#fff',fontWeight:700,fontSize:'1.2rem',cursor:'pointer'}}>×</button>
    </div>
  );
}

function ProfileDropdown({ onLogout }) {
  const [open, setOpen] = useState(false);
  // Try to get username from localStorage or fallback
  const username = localStorage.getItem('username') || 'User';
  return (
    <div style={{position:'relative'}}>
      <button className="nav-btn" style={{borderRadius:'50%',padding:'0.4rem 0.7rem',fontWeight:700}} onClick={()=>setOpen(v=>!v)}>
        <span role="img" aria-label="profile">👤</span>
      </button>
      {open && (
        <div style={{position:'absolute',top:'110%',right:0,background:'#fff',color:'#222',boxShadow:'0 2px 12px #0002',borderRadius:10,padding:'1rem',minWidth:180,zIndex:1000}}>
          <div style={{fontWeight:600,marginBottom:8}}>User Profile</div>
          <div style={{fontSize:'1.05rem',marginBottom:12}}><b>{username}</b></div>
          <button className="btn danger" style={{width:'100%'}} onClick={onLogout}>Sign Out</button>
        </div>
      )}
    </div>
  );
}



function Navbar({ isAuth, onLogout }) {
  const navigate = useNavigate();
  return (
    <nav className="navbar">
      <div style={{display:'flex',alignItems:'center',gap:'0.7rem',cursor:'pointer'}} onClick={() => navigate(isAuth ? '/tasks' : '/login')}>
        <img src={process.env.PUBLIC_URL + '/task-manager-logo.png'} alt="Task Manager Logo" style={{height:'50px',width:'50px',objectFit:'contain',marginRight:'0.5rem',borderRadius:'8px',boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}} />
        <h1>Task Flow</h1>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:'0.8rem'}}>
        {isAuth ? (
          <ProfileDropdown onLogout={onLogout} />
        ) : (
          <>
            <button className="nav-btn" onClick={() => navigate('/login')}>Login</button>
            <button className="nav-btn" onClick={() => navigate('/register')}>Sign Up</button>
          </>
        )}
      </div>
    </nav>
  );
}



function App() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('token'));
  const [toast, setToast] = useState({ message: '', type: 'success' });


  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsAuth(false);
    setToast({ message: 'Logged out successfully!', type: 'success' });
  };

  // Toast close handler
  const closeToast = () => setToast({ message: '', type: 'success' });
  


  return (
    <div className="app-bg light-bg" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/pngtask-management.png)` }}>
      <div className="bg-bubbles">
        {Array.from({ length: 10 }).map((_, i) => <span key={i}></span>)}
      </div>
      <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      <Router>
        <Navbar isAuth={isAuth} onLogout={handleLogout} />
        <Routes>
          <Route path="/login" element={<Login setIsAuth={setIsAuth} />} />
          <Route path="/register" element={<Register setIsAuth={setIsAuth} />} />
          <Route path="/tasks" element={isAuth ? <Tasks setToast={setToast} /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to={isAuth ? "/tasks" : "/login"} />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;