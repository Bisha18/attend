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
    console.log('Attendance API - user:', user);
    if (!user) {
      return unauthorized();
    }
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    let dateParam = searchParams.get('date');
    const sessionId = searchParams.get('sessionId');
    const branchParam = searchParams.get('branch');
    
    // Default to today if date not provided
    if (!dateParam) {
      dateParam = new Date().toISOString().split('T')[0];
    }

    if (user.role === 'STUDENT') {
      let query = { studentId: user.userId, date: dateParam };
      
      const studentAttendances = await Attendance.find(query)
        .populate('sessionId', 'branch subject')
        .populate('studentId', 'name email rfidUid')
        .sort({ timestamp: -1 })
        .lean();
        
      const rfidUidsThisDate = await fetchRfidData(dateParam);
        
      let formattedAttendances = studentAttendances.map(att => {
        const student = att.studentId;
        const hasRfid = student?.rfidUid ? rfidUidsThisDate.includes(student.rfidUid) : false;
        
        // Student submitted geo + selfie attendance = Present
        // RFID is shown as extra info but doesn't block Present status
        const finalStatus = 'Present';
        
        const branch = att.branch || att.sessionId?.branch || '';
        
        return {
          _id: att._id,
          studentId: student,
          timestamp: att.timestamp,
          date: att.date,
          branch,
          subject: att.subject || att.sessionId?.subject || '',
          mapStatus: 'Verified',
          rfidStatus: hasRfid ? 'Scanned' : 'Not Scanned',
          selfieUrl: att.selfieUrl || null,
          faceVerified: att.faceVerified ?? null,
          faceConfidence: att.faceConfidence ?? null,
          finalStatus
        };
      });
      
      if (studentAttendances.length === 0) {
        const rfidStudent = await User.findById(user.userId).lean();
        const hasRfidScanned = rfidStudent?.rfidUid ? rfidUidsThisDate.includes(rfidStudent.rfidUid) : false;
        if (hasRfidScanned) {
          formattedAttendances.push({
            _id: `rfid_only_${rfidStudent._id}`,
            studentId: rfidStudent,
            timestamp: new Date().toISOString(),
            date: dateParam,
            branch: rfidStudent.branch || '',
            subject: '',
            mapStatus: 'Not Verified',
            rfidStatus: 'Scanned',
            finalStatus: 'Absent'
          });
        }
      }
      
      if (branchParam) {
        formattedAttendances = formattedAttendances.filter(a => a.branch === branchParam);
      }
      
      return NextResponse.json(formattedAttendances, { status: 200 });
    }

    if (user.role !== 'TEACHER') {
      console.warn('Attendance API - user role is not TEACHER:', user.role);
      return NextResponse.json({ message: `Not authorized. Role is ${user.role}` }, { status: 401 });
    }
    
    let sessionQuery = { teacherId: user.userId };
    if (branchParam) {
      sessionQuery.branch = branchParam;
    }
    const teacherSessions = await Session.find(sessionQuery).select('_id branch subject').lean();
    const teacherSessionIds = teacherSessions.map((s) => s._id.toString());
    // Build a map from sessionId to branch/subject for quick lookup
    const sessionBranchMap = {};
    const sessionSubjectMap = {};
    teacherSessions.forEach(s => { 
      sessionBranchMap[s._id.toString()] = s.branch || ''; 
      sessionSubjectMap[s._id.toString()] = s.subject || ''; 
    });

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
      .lean();

    // 2. Get full RFID logs for the date (includes UID + NAME)
    const { fetchAllRfidLogs } = await import('@/lib/rfid');
    const rfidLogs = await fetchAllRfidLogs(dateParam);
    const rfidUidsThisDate = rfidLogs.map(l => l.UID);
    const rfidNamesThisDate = rfidLogs.map(l => (l.NAME || '').toLowerCase().trim());

    // Helper: check if a student has RFID match (by UID or by first-name fallback)
    const studentHasRfid = (student) => {
      if (!student) return false;
      // Primary: UID match in DB
      if (student.rfidUid && rfidUidsThisDate.includes(student.rfidUid)) return true;
      // Fallback: match first name against RFID log name (handles unlinked UIDs)
      const firstName = (student.name || '').split(' ')[0].toLowerCase().trim();
      if (firstName && rfidNamesThisDate.some(n => n.includes(firstName) || firstName.includes(n))) return true;
      return false;
    };
    
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

      const hasRfid = studentHasRfid(student);
      
      // 3-way verification: geo (Attendance record exists) + selfie + RFID
      const finalStatus = hasRfid ? 'Present' : 'Absent';
      
      mergedData.push({
        _id: att._id,
        studentId: student,
        timestamp: att.timestamp,
        date: att.date,
        branch: att.branch || sessionBranchMap[att.sessionId?.toString()] || '',
        subject: att.subject || sessionSubjectMap[att.sessionId?.toString()] || '',
        mapStatus: 'Verified',
        rfidStatus: hasRfid ? 'Scanned' : 'Not Scanned',
        selfieUrl: att.selfieUrl || null,
        faceVerified: att.faceVerified ?? null,
        faceConfidence: att.faceConfidence ?? null,
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
