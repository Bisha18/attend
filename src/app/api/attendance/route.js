import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';
import { getUser, unauthorized } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = getUser(request);
    if (!user || user.role !== 'TEACHER') {
      return unauthorized();
    }

    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const sessionId = searchParams.get('sessionId');
    
    let query = {};
    if (date) query.date = date;
    if (sessionId) query.sessionId = sessionId;

    const attendances = await Attendance.find(query)
      .populate('studentId', 'name email')
      .sort({ timestamp: -1 });

    return NextResponse.json(attendances, { status: 200 });
  } catch (error) {
    console.error('Get Attendance Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
