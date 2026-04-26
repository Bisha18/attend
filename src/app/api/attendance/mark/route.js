import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';
import Attendance from '@/models/Attendance';
import { getUser, unauthorized } from '@/lib/auth';
import { getDistance } from '@/lib/geo';
import cloudinary from '@/lib/cloudinary';
import { verifyFace } from '@/lib/face';

export async function POST(request) {
  try {
    const user = getUser(request);
    if (!user || user.role !== 'STUDENT') {
      return unauthorized();
    }

    await dbConnect();

    const body = await request.json();
    const { latitude, longitude, selfieBase64, sessionId } = body;

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json({ message: 'Please provide GPS coordinates' }, { status: 400 });
    }

    if (!selfieBase64) {
      return NextResponse.json({ message: 'Live selfie is required' }, { status: 400 });
    }

    if (!sessionId) {
      return NextResponse.json({ message: 'No session selected' }, { status: 400 });
    }

    const session = await Session.findById(sessionId);
    if (!session || !session.active) {
      return NextResponse.json({ message: 'Selected session is no longer active.' }, { status: 404 });
    }

    // Check distance
    const distance = getDistance(latitude, longitude, session.latitude, session.longitude);
    if (distance > session.radius) {
      return NextResponse.json({ message: `Outside attendance radius (${Math.round(distance)}m > ${session.radius}m)` }, { status: 403 });
    }

    const date = new Date().toISOString().split('T')[0];

    // Check duplicate
    const existing = await Attendance.findOne({
      studentId: user.userId,
      sessionId: session._id,
      date
    });
    if (existing) {
      return NextResponse.json({ message: 'Attendance already marked for today' }, { status: 400 });
    }

    // ── Face Verification ──────────────────────────────────────────
    // If the student has a registered face, verify the selfie against it.
    // If it doesn't match, block the attendance.
    let faceResult = null;
    try {
      faceResult = await verifyFace(user.userId, selfieBase64);
      
      if (faceResult && faceResult.verified === false) {
        const msg = faceResult.message || '';
        const isServiceError = msg.includes('unavailable');
        const isNotRegistered = msg.includes('No registered face');

        if (!isServiceError && !isNotRegistered) {
          // Face did not match! Reject attendance.
          return NextResponse.json({
            message: `Biometric mismatch: ${msg || 'Face did not match registered profile'}`,
            faceConfidence: faceResult.confidence,
          }, { status: 403 });
        }
      }
    } catch (faceError) {
      console.warn('Face verification skipped (service unavailable):', faceError.message);
    }

    // Upload selfie
    let selfieUrl = selfieBase64; // default fallback
    try {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;

      if (cloudName && apiKey && apiSecret) {
        const uploadResponse = await cloudinary.uploader.upload(selfieBase64, {
          folder: `attendance/selfies/${date}/${user.userId}`,
          resource_type: 'image',
        });
        selfieUrl = uploadResponse.secure_url;
        console.log('Selfie uploaded to Cloudinary:', selfieUrl);
      } else {
        console.log('Cloudinary not configured, storing base64 locally.');
      }
    } catch (uploadError) {
      // Don't block attendance - just store base64 as fallback
      console.error('Cloudinary upload failed, using base64 fallback:', uploadError.message);
      selfieUrl = selfieBase64;
    }

    const attendance = await Attendance.create({
      studentId: user.userId,
      sessionId: session._id,
      date,
      branch: session.branch || '',
      subject: session.subject || '',
      status: 'PRESENT',
      selfieUrl,
      faceVerified: faceResult?.verified ?? null,
      faceConfidence: faceResult?.confidence ?? null,
    });

    return NextResponse.json({
      message: 'Attendance marked successfully',
      attendance,
      faceVerification: faceResult ? {
        verified: faceResult.verified,
        confidence: faceResult.confidence,
      } : null,
    }, { status: 201 });

  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ message: 'Attendance already marked for today' }, { status: 400 });
    }
    console.error('Mark Attendance Error:', error);
    return NextResponse.json({ message: 'Server error: ' + error.message }, { status: 500 });
  }
}
