import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

// POST handler for login
export async function POST(request) {
  try {
    await dbConnect();
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ message: 'Please provide all required fields' }, { status: 400 });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'fallback-secret-here', { expiresIn: '30d' });
    return NextResponse.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token }, { status: 200 });
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// GET handler returns method not allowed
export async function GET(request) {
  return NextResponse.json({ message: 'Login endpoint expects POST' }, { status: 405, headers: { Allow: 'POST,OPTIONS' } });
}

// OPTIONS handler for CORS preflight
export async function OPTIONS(request) {
  return new Response(null, { status: 200, headers: { Allow: 'POST,OPTIONS', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } });
}
