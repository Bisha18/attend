import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';
import { getUser, unauthorized } from '@/lib/auth';

import User from '@/models/User';
import { fetchRfidData } from '@/lib/rfid';

export async function GET(request) {
  try {
    const user = getUser(request);
    if (!user || user.role !== 'TEACHER') {
      return unauthorized();
    }

    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    let dateParam = searchParams.get('date');
    const sessionId = searchParams.get('sessionId');
    
    // Default to today if date not provided
    if (!dateParam) {
      dateParam = new Date().toISOString().split('T')[0];
    }
    
    let query = { date: dateParam };
    if (sessionId) query.sessionId = sessionId;

    // 1. Get map attendances
    const mapAttendances = await Attendance.find(query)
      .populate('studentId', 'name email rfidUid')
      .sort({ timestamp: -1 })
      .lean(); // Use lean() to allow adding properties

    // 2. Get RFID scans for the date
    const rfidUidsThisDate = await fetchRfidData(dateParam);
    
    // 3. Find all students that scanned RFID today but didn't mark map attendance
    const rfidOnlyUsers = await User.find({
      role: 'STUDENT',
      rfidUid: { $in: rfidUidsThisDate }
    }).lean();

    // Mapping to track which students are already in the map check-ins
    const mapStudentIds = new Set(mapAttendances.map(a => a.studentId._id.toString()));

    let mergedData = [];

    // Process map attendances
    for (const att of mapAttendances) {
      const student = att.studentId;
      const hasRfid = student.rfidUid ? rfidUidsThisDate.includes(student.rfidUid) : false;
      
      mergedData.push({
        _id: att._id,
        studentId: student,
        timestamp: att.timestamp,
        date: att.date,
        mapStatus: 'Verified',
        rfidStatus: hasRfid ? 'Scanned' : 'Not Scanned',
        finalStatus: hasRfid ? 'Present' : 'Invalid' 
      });
    }

    // Process RFID-only attendances
    for (const stu of rfidOnlyUsers) {
      if (!mapStudentIds.has(stu._id.toString())) {
        mergedData.push({
          _id: `rfid_only_${stu._id}`,
          studentId: stu,
          timestamp: new Date().toISOString(), // Mock timestamp for RFID
          date: dateParam,
          mapStatus: 'Not Verified',
          rfidStatus: 'Scanned',
          finalStatus: 'Absent'
        });
      }
    }

    return NextResponse.json(mergedData, { status: 200 });
  } catch (error) {
    console.error('Get Attendance Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
