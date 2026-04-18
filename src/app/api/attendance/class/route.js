import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { fetchAllRfidLogs } from '@/lib/rfid';
import { getUser, unauthorized } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = getUser(request);
    if (!user || user.role !== 'TEACHER') {
      return unauthorized();
    }

    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    let dateParam = searchParams.get('date');
    
    // Default to today if date not provided
    if (!dateParam) {
      dateParam = new Date().toISOString().split('T')[0];
    }

    // Get all RFID scan LOGS for the date (or all if we wanted)
    const rawLogs = await fetchAllRfidLogs(dateParam);
    
    // Remove recurring logs (keep only the first scan in the sequence per UID)
    const seenUids = new Set();
    const logsThisDate = [];
    for (const log of rawLogs) {
      if (!seenUids.has(log.UID)) {
        seenUids.add(log.UID);
        logsThisDate.push(log);
      }
    }
    
    // Extract unique UIDs to fetch user data for association
    const uids = [...new Set(logsThisDate.map(l => l.UID))];

    // Find all students that match those UIDs
    const rfidUsers = await User.find({
      role: 'STUDENT',
      rfidUid: { $in: uids }
    }).select('name email rfidUid subject semester').lean();

    // Create a dictionary for fast lookup
    const userDict = {};
    rfidUsers.forEach(u => {
      userDict[u.rfidUid] = u;
    });

    // Map each LOG to a unified response, showing the exact time and sequence
    const classAttendance = logsThisDate.map((log, index) => ({
      _id: `rfid_log_${log.UID}_${index}`,
      studentId: userDict[log.UID] || null, // Can be null if unregistered UID
      rawUid: log.UID,
      rawName: log.NAME,
      date: log.DATE,
      time: log.TIME,
      status: log.STATUS,
    }));

    return NextResponse.json(classAttendance.reverse(), { status: 200 }); // Reverse so latest is first
  } catch (error) {
    console.error('Get Class Attendance Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
