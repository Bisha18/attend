import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';
import Session from '@/models/Session';
import User from '@/models/User';
import { getUser, unauthorized } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = getUser(request);
    if (!user || user.role !== 'TEACHER') {
      return unauthorized();
    }
    
    await dbConnect();
    
    const teacherSessions = await Session.find({ teacherId: user.userId }).lean();
    const sessionIds = teacherSessions.map(s => s._id);
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const totalSessions = sessionIds.length;
    const monthSessionsCount = teacherSessions.filter(s => new Date(s.createdAt) >= thirtyDaysAgo).length;

    const attendances = await Attendance.find({ sessionId: { $in: sessionIds } })
      .populate('studentId', 'name email branch semester')
      .lean();
      
    const studentStatsMap = {};
    
    attendances.forEach(att => {
      if (!att.studentId) return;
      const stuId = att.studentId._id.toString();
      
      if (!studentStatsMap[stuId]) {
        studentStatsMap[stuId] = {
          student: att.studentId,
          totalPresent: 0,
          monthPresent: 0
        };
      }
      
      if (att.status === 'PRESENT') {
        studentStatsMap[stuId].totalPresent++;
        if (new Date(att.timestamp) >= thirtyDaysAgo) {
          studentStatsMap[stuId].monthPresent++;
        }
      }
    });

    const results = Object.values(studentStatsMap).map(s => {
      const totalAbsent = Math.max(0, totalSessions - s.totalPresent);
      const monthAbsent = Math.max(0, monthSessionsCount - s.monthPresent);
      
      return {
        student: s.student,
        stats: {
          totalSessions,
          present: s.totalPresent,
          absent: totalAbsent,
          percentage: totalSessions > 0 ? Math.round((s.totalPresent / totalSessions) * 100) : 0
        },
        monthStats: {
          total: monthSessionsCount,
          present: s.monthPresent,
          absent: monthAbsent,
          percentage: monthSessionsCount > 0 ? Math.round((s.monthPresent / monthSessionsCount) * 100) : 0
        }
      };
    });

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('Stats Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
