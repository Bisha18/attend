import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';
import Session from '@/models/Session';
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
    const subjectParam = searchParams.get('subject');
    
    // Default to today if date not provided
    if (!dateParam) {
      dateParam = new Date().toISOString().split('T')[0];
    }
    
    let sessionQuery = { teacherId: user.userId };
    if (subjectParam) {
      sessionQuery.subject = subjectParam;
    }
    const teacherSessions = await Session.find(sessionQuery).select('_id subject').lean();
    const teacherSessionIds = teacherSessions.map((s) => s._id.toString());
    // Build a map from sessionId to subject for quick lookup
    const sessionSubjectMap = {};
    teacherSessions.forEach(s => { sessionSubjectMap[s._id.toString()] = s.subject || ''; });

    let query = { date: dateParam, sessionId: { $in: teacherSessionIds } };
    if (sessionId) {
      if (!teacherSessionIds.includes(sessionId)) {
        return NextResponse.json({ message: 'Session does not belong to this teacher' }, { status: 403 });
      }
      query.sessionId = sessionId;
    }

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
    const mapStudentIds = new Set(
      mapAttendances.filter(a => a.studentId).map(a => a.studentId._id.toString())
    );

    let mergedData = [];

    // Process map attendances
    for (const att of mapAttendances) {
      const student = att.studentId;
      if (!student) continue;

      const hasRfid = student.rfidUid ? rfidUidsThisDate.includes(student.rfidUid) : false;
      const hasSelfie = !!att.selfieUrl;
      
      let finalStatus = 'Invalid';
      if (hasSelfie) finalStatus = 'Present'; // Map verified + Selfie = Present (RFID is optional bonus)
      else if (hasRfid && !hasSelfie) finalStatus = 'Absent';  // RFID only, no selfie proof
      
      mergedData.push({
        _id: att._id,
        studentId: student,
        timestamp: att.timestamp,
        date: att.date,
        subject: att.subject || sessionSubjectMap[att.sessionId?.toString()] || '',
        mapStatus: 'Verified',
        rfidStatus: hasRfid ? 'Scanned' : 'Not Scanned',
        selfieUrl: att.selfieUrl || null,
        finalStatus
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
