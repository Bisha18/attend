import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';
import { getUser, unauthorized } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = getUser(request);
    if (!user) {
      return unauthorized();
    }

    await dbConnect();
    
    if (user.role === 'TEACHER') {
      const session = await Session.findOne({ active: true, teacherId: user.userId }).sort({ startTime: -1 });
      if (!session) {
        return NextResponse.json({ message: 'No active session' }, { status: 404 });
      }
      return NextResponse.json(session, { status: 200 });
    } else {
      // Students see all active sessions
      const sessions = await Session.find({ active: true })
        .populate('teacherId', 'name')
        .sort({ startTime: -1 });
      return NextResponse.json(sessions, { status: 200 });
    }
  } catch (error) {
    console.error('Active Session Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
