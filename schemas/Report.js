import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  type: {
    type: String,
    required: true,
    enum: ['bug', 'feature', 'security', 'content', 'other']
  },
  pageUrl: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'in-progress', 'resolved', 'rejected']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    default: 'medium',
    enum: ['low', 'medium', 'high', 'critical']
  }
}, {
  timestamps: true
});

export default mongoose.models.Report || mongoose.model('Report', ReportSchema);
