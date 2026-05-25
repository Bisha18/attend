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
      .sort({ timestamp: -1 })
      .lean();
      
    // Fetch RFID data for the student
    const User = require('@/models/User').default;
    const { fetchAllRfidLogs } = require('@/lib/rfid');
    const studentUser = await User.findById(user.userId).lean();
    const rfidLogs = await fetchAllRfidLogs();
    
    // Map of dates where student scanned RFID
    const studentRfidDates = new Set(
      rfidLogs
        .filter(log => log.UID === studentUser?.rfidUid)
        .map(log => log.DATE) // Assuming DATE format is DD/MM/YYYY
    );

    const formattedAttendances = attendances.map(att => {
      // Date in attendance is YYYY-MM-DD
      const [year, month, day] = att.date.split('-');
      const formattedDate = `${day}/${month}/${year}`;
      const hasRfid = studentRfidDates.has(formattedDate);
      
      return {
        ...att,
        rfidStatus: hasRfid ? 'Scanned' : 'Not Scanned',
        finalStatus: hasRfid ? 'Present' : 'Absent'
      };
    });

    // Calculate overall stats
    const totalSessions = await Session.countDocuments();
    const presentCount = formattedAttendances.filter(a => a.finalStatus === 'Present').length;
    const absentCount = totalSessions - presentCount;

    // Calculate branch-wise stats
    // Get all unique branches and subjects from sessions
    const allSessions = await Session.find({}).select('branch subject').lean();
    const branchSessionCounts = {};
    allSessions.forEach(s => {
      const b = s.branch || 'Unknown';
      branchSessionCounts[b] = (branchSessionCounts[b] || 0) + 1;
    });

    const branchPresentCounts = {};
    formattedAttendances.forEach(a => {
      const b = a.branch || a.sessionId?.branch || 'Unknown';
      if (a.finalStatus === 'Present') {
        branchPresentCounts[b] = (branchPresentCounts[b] || 0) + 1;
      }
    });

    const branches = [...new Set([...Object.keys(branchSessionCounts), ...Object.keys(branchPresentCounts)])];
    const branchStats = branches.map(b => {
      const total = branchSessionCounts[b] || 0;
      const present = branchPresentCounts[b] || 0;
      const absent = Math.max(0, total - present);
      return {
        branch: b,
        total,
        present,
        absent,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0
      };
    });

    // Calculate subject-wise stats
    const subjectSessionCounts = {};
    allSessions.forEach(s => {
      const sub = s.subject || 'Unknown';
      subjectSessionCounts[sub] = (subjectSessionCounts[sub] || 0) + 1;
    });

    const subjectPresentCounts = {};
    formattedAttendances.forEach(a => {
      const sub = a.sessionId?.subject || 'Unknown';
      if (a.finalStatus === 'Present') {
        subjectPresentCounts[sub] = (subjectPresentCounts[sub] || 0) + 1;
      }
    });

    const subjects = [...new Set([...Object.keys(subjectSessionCounts), ...Object.keys(subjectPresentCounts)])];
    const subjectStats = subjects.map(sub => {
      const total = subjectSessionCounts[sub] || 0;
      const present = subjectPresentCounts[sub] || 0;
      const absent = Math.max(0, total - present);
      return {
        subject: sub,
        total,
        present,
        absent,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0
      };
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthSessionsCount = await Session.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const monthPresentCount = formattedAttendances.filter(a => a.finalStatus === 'Present' && new Date(a.timestamp) >= thirtyDaysAgo).length;
    const monthAbsentCount = Math.max(0, monthSessionsCount - monthPresentCount);

    return NextResponse.json({
        attendances: formattedAttendances,
        stats: {
            total: totalSessions,
            present: presentCount,
            absent: absentCount > 0 ? absentCount : 0,
            percentage: totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0
        },
        monthStats: {
            total: monthSessionsCount,
            present: monthPresentCount,
            absent: monthAbsentCount,
            percentage: monthSessionsCount > 0 ? Math.round((monthPresentCount / monthSessionsCount) * 100) : 0
        },
        branchStats,
        subjectStats
    }, { status: 200 });
  } catch (error) {
    console.error('Get My Attendance Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
