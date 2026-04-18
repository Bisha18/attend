import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['TEACHER', 'STUDENT'],
    default: 'STUDENT'
  },
  rfidUid: {
    type: String,
    unique: true,
    sparse: true
  },
  subject: {
    type: String,
  },
  semester: {
    type: String,
  }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
