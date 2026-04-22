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
    
    // Teachers should see only their own active session.
    // Students can read the latest active session.
    const query = user.role === 'TEACHER'
      ? { active: true, teacherId: user.userId }
      : { active: true };
    const session = await Session.findOne(query).sort({ startTime: -1 });

    if (!session) {
      return NextResponse.json({ message: 'No active session' }, { status: 404 });
    }

    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    console.error('Active Session Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
