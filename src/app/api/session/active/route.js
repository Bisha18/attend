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
    
    // Get active session
    const session = await Session.findOne({ active: true }).sort({ startTime: -1 });

    if (!session) {
      return NextResponse.json({ message: 'No active session' }, { status: 404 });
    }

    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    console.error('Active Session Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
