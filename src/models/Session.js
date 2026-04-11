import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  radius: {
    type: Number,
    required: true,
    default: 50 // meters
  },
  active: {
    type: Boolean,
    default: true
  },
  startTime: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.models.Session || mongoose.model('Session', SessionSchema);
