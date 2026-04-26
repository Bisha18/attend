import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  date: {
    type: String, // format YYYY-MM-DD
    required: true
  },
  branch: {
    type: String,
    default: ''
  },
  subject: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['PRESENT', 'ABSENT'],
    default: 'PRESENT'
  },
  selfieUrl: {
    type: String
  },
  faceVerified: {
    type: Boolean,
    default: null
  },
  faceConfidence: {
    type: Number,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Ensure one attendance per day per session
AttendanceSchema.index({ studentId: 1, sessionId: 1, date: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
