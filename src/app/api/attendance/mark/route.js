import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';
import Attendance from '@/models/Attendance';
import { getUser, unauthorized } from '@/lib/auth';
import { getDistance } from '@/lib/geo';

export async function POST(request) {
  try {
    const user = getUser(request);
    if (!user || user.role !== 'STUDENT') {
      return unauthorized();
    }

    await dbConnect();
    
    const { latitude, longitude } = await request.json();

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json({ message: 'Please provide GPS coordinates' }, { status: 400 });
    }

    // Get active session
    const session = await Session.findOne({ active: true });

    if (!session) {
      return NextResponse.json({ message: 'No active session' }, { status: 404 });
    }

    // Check distance
    const distance = getDistance(latitude, longitude, session.latitude, session.longitude);

    if (distance > session.radius) {
      return NextResponse.json({ message: `Outside attendance radius (${Math.round(distance)}m > ${session.radius}m)` }, { status: 403 });
    }

    const date = new Date().toISOString().split('T')[0];

    // Check if duplicate for today for this session
    const existing = await Attendance.findOne({
      studentId: user.userId,
      sessionId: session._id,
      date
    });

    if (existing) {
      return NextResponse.json({ message: 'Attendance already marked for today' }, { status: 400 });
    }

    const attendance = await Attendance.create({
      studentId: user.userId,
      sessionId: session._id,
      date,
      status: 'PRESENT'
    });

    return NextResponse.json({ message: 'Attendance marked successfully', attendance }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
       return NextResponse.json({ message: 'Attendance already marked for today' }, { status: 400 });
    }
    console.error('Mark Attendance Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
