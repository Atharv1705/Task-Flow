import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Use pastel / silent palette via CSS variables
const PRIORITY_COLORS = {
  Low: 'var(--color-success)',   // calm aqua
  Medium: 'var(--color-warning)', // soft yellow
  High: 'var(--color-danger)',    // gentle rose
};

export default function Tasks({ setToast }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [dueDate, setDueDate] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sort, setSort] = useState('date');

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const api = axios.create({
    baseURL: '/api/tasks',
    headers: { Authorization: `Bearer ${token}` }
  });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/');
      console.log('Fetched tasks:', res.data);
      
      // Process tasks to ensure priority is properly set
      const processedTasks = res.data.map(task => ({
        ...task,
        priority: task.priority || 'Medium'
      }));
      
      console.log('Processed tasks:', processedTasks);
      setTasks(processedTasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to fetch tasks');
    }
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleAddOrEdit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Ensure priority is properly set - force it to be a string value
      const currentPriority = String(priority || 'Medium');
      console.log('Submitting with priority:', currentPriority);
      
      const payload = { 
        title, 
        description, 
        category,
        dueDate,
        reminderDate,
        priority: currentPriority,
        tags,
        status: editing ? editing.status : 'pending'
      };
      
      console.log('Full payload:', payload);

      let response;
      if (editing) {
        // For debugging, log the exact payload and ID being sent
        console.log(`Updating task ${editing._id} with priority:`, payload.priority);
        response = await api.put(`/${editing._id}`, payload);
        console.log('Edit response:', response.data);
        
        // Update the task directly in the state to ensure UI reflects changes
        setTasks(prevTasks => prevTasks.map(task => 
          task._id === editing._id ? {...task, ...payload} : task
        ));
      } else {
        response = await api.post('/', payload);
        console.log('Create response:', response.data);
        
        // Add the new task to the state
        if (response.data) {
          setTasks(prevTasks => [...prevTasks, response.data]);
        }
      }
      
      // Immediately fetch tasks to update the UI
      await fetchTasks();

      // reset form
      setTitle(''); 
      setDescription(''); 
      setCategory('General');
      setDueDate('');
      setReminderDate('');
      setPriority('Medium');
      setTags([]);
      setTagInput('');
      setEditing(null); 

      fetchTasks();
    } catch {
      setError('Failed to save task');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/${id}`);
      fetchTasks();
    } catch (err) {
      setError('Failed to delete task');
    }
    setLoading(false);
  };

  const handleToggle = async (id) => {
    setLoading(true);
    try {
      await api.patch(`/${id}/toggle`);
      fetchTasks();
    } catch (err) {
      setError('Failed to update task status');
    }
    setLoading(false);
  };

  const handleClearCompleted = async () => {
    setLoading(true);
    try {
      const completedTasks = tasks.filter(t => t.status === 'completed');
      if (completedTasks.length === 0) {
        setLoading(false);
        return;
      }
      for (const task of completedTasks) {
        await api.delete(`/${task._id}`);
      }
      fetchTasks();
    } catch (err) {
      setError('Failed to clear completed tasks');
    }
    setLoading(false);
  };

  // Filtering, searching, sorting
  let filtered = tasks.filter(task =>
    (filter === 'all' || task.status === filter) &&
    (categoryFilter === 'all' || (task.category || 'General') === categoryFilter) &&
    (search === '' || 
      task.title.toLowerCase().includes(search.toLowerCase()) || 
      (task.description && task.description.toLowerCase().includes(search.toLowerCase()))
    )
  );
  if (sort === 'date') filtered = filtered.sort((a, b) => {
    // Sort by due date if available, otherwise fall back to createdAt
    // Handle null/undefined dates properly
    const dateA = a.dueDate ? new Date(a.dueDate) : new Date(a.createdAt || Date.now());
    const dateB = b.dueDate ? new Date(b.dueDate) : new Date(b.createdAt || Date.now());
    // Sort by closest due date first
    return dateA - dateB;
  });
  if (sort === 'status') filtered = filtered.sort((a, b) => a.status.localeCompare(b.status));
  if (sort === 'priority') filtered = filtered.sort((a, b) => {
    const order = { High: 1, Medium: 2, Low: 3 };
    return order[a.priority || 'Medium'] - order[b.priority || 'Medium'];
  });
  if (sort === 'category') filtered = filtered.sort((a, b) => (a.category || '').localeCompare(b.category || ''));

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="tasks-responsive-layout">
      {/* Sidebar summary */}
      <div className="tasks-sidebar">
        <h2 style={{marginBottom:16,letterSpacing:1,fontWeight:700,fontSize:'1.5rem',color:'var(--color-primary)'}}>Overview</h2>
        <div style={{marginBottom:18}}>
          <div style={{fontWeight:600,fontSize:'1.1rem'}}>Total Tasks: <span style={{color:'var(--color-primary)'}}>{tasks.length}</span></div>
          <div style={{fontWeight:600,fontSize:'1.1rem'}}>Completed: <span style={{color:'var(--color-success)'}}>{completedCount}</span></div>
          <div style={{fontWeight:600,fontSize:'1.1rem'}}>Pending: <span style={{color:'var(--color-warning)'}}>{tasks.length-completedCount}</span></div>
        </div>

        <div style={{marginBottom:18}}>
          <div style={{fontWeight:500,marginBottom:6}}>Progress</div>
          <div style={{height:10,background:'var(--color-card-light)',borderRadius:8,overflow:'hidden'}}>
            <div style={{width:`${progress}%`,height:10,background:'var(--color-success)',transition:'width 0.4s'}}></div>
          </div>
          <div style={{fontSize:'0.97rem',marginTop:4}}>{progress}% completed</div>
        </div>

        <div style={{marginTop:18}}>
          <input className="input" style={{width:'100%',marginBottom:10}} placeholder="Search tasks..." value={search} onChange={e=>setSearch(e.target.value)} />
          <select className="input" style={{width:'100%',marginBottom:10}} value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select className="input" style={{width:'100%',marginBottom:10}} value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)}>
            <option value="all">All Categories</option>
            {Array.from(new Set(tasks.map(task => task.category || 'General'))).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select className="input" style={{width:'100%'}} value={sort} onChange={e=>setSort(e.target.value)}>
            <option value="date">Sort by Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="status">Sort by Status</option>
            <option value="category">Sort by Category</option>
          </select>
        </div>
      </div>

      {/* Main content */}
      <div className="tasks-main-content">
        <form className="task-form tasks-form-card" onSubmit={handleAddOrEdit}>
          <input className="input" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
          <input className="input" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
          <input className="input" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} />
          <select className="input" value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              {/* Debug priority value */}
              <div style={{fontSize: '0.8rem', color: '#888'}}>Current priority: {priority}</div>
          <div style={{gridColumn:'1/3', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
            <input 
              className="input" 
              type="date" 
              value={dueDate} 
              onChange={e => setDueDate(e.target.value)} 
              placeholder="Due Date" 
              title="Due Date"
            />
            <input 
              className="input" 
              type="datetime-local" 
              value={reminderDate} 
              onChange={e => setReminderDate(e.target.value)} 
              placeholder="Set Reminder" 
              title="Set Reminder"
            />
          </div>
          <button className="btn primary" type="submit" disabled={loading} style={{gridColumn:'1/2'}}>{editing ? 'Edit' : 'Add'} Task</button>
          {editing ? (
            <button 
              className="btn warning" 
              type="button" 
              style={{gridColumn:'2/3'}} 
              onClick={() => { 
                setEditing(null); 
                setTitle(''); 
                setDescription(''); 
                setDueDate(''); 
                setPriority('Medium'); 
                setCategory('General');
                setTags([]);
                setTagInput('');
                setReminderDate('');
              }}
            >
              Cancel
            </button>
          ) : (
            <button className="btn danger" type="button" style={{gridColumn:'2/3'}} onClick={handleClearCompleted}>Clear Completed</button>
          )}
        </form>

        {error && <div className="error-msg">{error}</div>}
        {loading && <div className="loading">Loading...</div>}

        <div className="tasks-grid">
          {filtered.map(task => (
            <div 
              className={`task-item ${task.status}`} 
              key={task._id} 
              style={{
                borderLeft:`6px solid ${PRIORITY_COLORS[task.priority||'Medium']}`, 
                position:'relative'
              }}
            >
              <div className="task-main" style={{marginBottom:8}}>
                <span className="task-title" style={{textDecoration: task.status==='completed'?'line-through':'none',fontWeight:600,fontSize:'1.15rem'}}>{task.title}</span>
                <span className="task-desc" style={{fontSize:'0.98rem',color:'#555'}}>{task.description}</span>
              </div>

              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,flexWrap:'wrap'}}>
                <span style={{fontSize:'0.95rem',fontWeight:500,background:'var(--color-card-light)',color:'var(--color-text-light)',borderRadius:8,padding:'2px 10px'}}>{task.category || 'General'}</span>
                {task.dueDate && <span style={{fontSize:'0.95rem',color:'#888'}}>Due: {new Date(task.dueDate).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})}</span>}
                <span style={{fontSize:'0.95rem',fontWeight:500,color:PRIORITY_COLORS[task.priority||'Medium'],background:'var(--color-card-light)',borderRadius:8,padding:'2px 10px'}}>Priority: {task.priority||'Medium'}</span>
                {/* Debug priority value */}
                <span style={{fontSize:'0.8rem', color: '#888'}}>(Raw priority value: {JSON.stringify(task.priority)})</span>
                <span style={{fontSize:'0.93rem',color:task.status==='completed'?'var(--color-success)':'var(--color-warning)'}}>Status: {task.status}</span>
              </div>

              {task.tags && task.tags.length > 0 && (
                <div style={{display:'flex',flexWrap:'wrap',gap:'0.4rem',marginBottom:'0.8rem'}}>
                  {task.tags.map((tag, idx) => (
                    <span key={idx} style={{fontSize:'0.85rem',background:'var(--color-card-light)',borderRadius:'12px',padding:'2px 8px'}}>{tag}</span>
                  ))}
                </div>
              )}

              {task.reminderDate && (
                <div style={{fontSize:'0.9rem',color:'#888',marginBottom:'0.5rem',display:'flex',alignItems:'center',gap:'0.3rem'}}>
                  <span role="img" aria-label="reminder">⏰</span>
                  {new Date(task.reminderDate).toLocaleString()}
                </div>
              )}

              <div className="task-actions" style={{marginTop:'auto'}}>
                <button className="btn small info" onClick={() => { 
                    const taskPriority = task.priority || 'Medium';
                    console.log('Setting edit mode with priority:', taskPriority);
                    
                    setEditing(task); 
                    setTitle(task.title); 
                    setDescription(task.description || '');
                    setCategory(task.category || 'General');
                    // Format the date for the input field (YYYY-MM-DD)
                    setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
                    // Ensure priority is set correctly
                    setPriority(taskPriority);
                    setTags(task.tags || []);
                    // Format the datetime for the input field (YYYY-MM-DDThh:mm)
                    setReminderDate(task.reminderDate ? new Date(task.reminderDate).toISOString().slice(0, 16) : '');
                    
                    // Force a re-render of the form
                    setTimeout(() => {
                      console.log('Current priority state after edit click:', priority);
                    }, 0);
                  }}>Edit</button>
                <button className="btn small danger" onClick={() => handleDelete(task._id)}>Delete</button>
                <button className="btn small info" onClick={() => handleToggle(task._id)}>
                  {task.status === 'completed' ? 'Mark Pending' : 'Mark Complete'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && <div style={{textAlign:'center',color:'#888',marginTop:'2rem'}}>No tasks found.</div>}
      </div>
    </div>
  );
}
