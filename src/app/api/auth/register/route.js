import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    await dbConnect();

    const { name, email, password, role, branch, semester, uid, selfieBase64 } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Please provide all required fields' }, { status: 400 });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    const isStudent = role === 'STUDENT' || !role;

    if (isStudent && !selfieBase64) {
      return NextResponse.json({ message: 'Face registration selfie is required for students' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Pre-generate ID so we can register the face first
    const mongoose = require('mongoose');
    const userId = new mongoose.Types.ObjectId();

    if (isStudent) {
      try {
        const FACE_SERVICE_URL = (process.env.FACE_SERVICE_URL || 'http://localhost:8001').replace(/\/+$/, '');
        const faceRes = await fetch(`${FACE_SERVICE_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: userId.toString(),
            image: selfieBase64
          })
        });

        if (!faceRes.ok) {
          const errorData = await faceRes.json();
          return NextResponse.json({ message: errorData.detail || 'Face registration failed' }, { status: faceRes.status });
        }
      } catch (faceErr) {
        console.error('Face Service Error:', faceErr);
        return NextResponse.json({ message: 'Biometric service is currently unavailable. Please try again later.' }, { status: 503 });
      }
    }

    const user = await User.create({
      _id: userId,
      name,
      email,
      password: hashedPassword,
      role: role || 'STUDENT',
      branch: branch || undefined,
      semester: semester || undefined,
      rfidUid: isStudent && uid ? uid : undefined,
    });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret-here',
      { expiresIn: '30d' }
    );

    return NextResponse.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    }, { status: 201 });

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
