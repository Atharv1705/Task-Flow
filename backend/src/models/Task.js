import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, default: 'General' },
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  dueDate: { type: Date },
  reminderDate: { type: Date },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Task', taskSchema);
