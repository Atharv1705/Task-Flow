import express from 'express';
import Task from '../models/Task.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all tasks for user
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, reminderDate, category, tags } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    const task = new Task({ 
      user: req.user.id, 
      title, 
      description,
      status,
      priority,
      dueDate,
      reminderDate,
      category,
      tags
    });
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Edit task
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, reminderDate, category, tags } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { title, description, status, priority, dueDate, reminderDate, category, tags },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle status
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    task.status = task.status === 'pending' ? 'completed' : 'pending';
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
