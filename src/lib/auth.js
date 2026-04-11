import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export function getUser(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-here');
    return decoded;
  } catch (error) {
    return null;
  }
}

export function unauthorized() {
  return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
}
