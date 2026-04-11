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
    
    const { latitude, longitude, radius } = await request.json();

    if (latitude === undefined || longitude === undefined || radius === undefined) {
      return NextResponse.json({ message: 'Please provide latitude, longitude, and radius' }, { status: 400 });
    }

    // Deactivate previous sessions for this teacher
    await Session.updateMany({ teacherId: user.userId, active: true }, { active: false });

    const session = await Session.create({
      teacherId: user.userId,
      latitude,
      longitude,
      radius,
      active: true,
      startTime: new Date()
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('Create Session Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
