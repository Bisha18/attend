import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';
import Session from '@/models/Session';
import { getUser, unauthorized } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = getUser(request);
    if (!user || user.role !== 'STUDENT') {
      return unauthorized();
    }

    await dbConnect();

    // Get my attendances
    const attendances = await Attendance.find({ studentId: user.userId })
      .populate('sessionId')
      .sort({ timestamp: -1 });
      
    // Calculate stats
    // Note: In real life, total classes would be based on all past sessions for the student's cohort.
    // For this app, we'll calculate based on unique sessions in the DB or just their attendances + some default
    const totalSessions = await Session.countDocuments();
    const presentCount = attendances.filter(a => a.status === 'PRESENT').length;
    // Assuming absent count is the diff
    const absentCount = totalSessions - presentCount;

    return NextResponse.json({
        attendances,
        stats: {
            total: totalSessions,
            present: presentCount,
            absent: absentCount > 0 ? absentCount : 0,
            percentage: totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0
        }
    }, { status: 200 });
  } catch (error) {
    console.error('Get My Attendance Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
