import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';
import { getUser, unauthorized } from '@/lib/auth';

export async function POST(request) {
  try {
    const user = getUser(request);
    if (!user || user.role !== 'TEACHER') {
      return unauthorized();
    }

    await dbConnect();

    // End all active sessions for this teacher
    const result = await Session.updateMany(
      { teacherId: user.userId, active: true },
      { active: false }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ message: 'No active session to end' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Session ended successfully' }, { status: 200 });
  } catch (error) {
    console.error('End Session Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
