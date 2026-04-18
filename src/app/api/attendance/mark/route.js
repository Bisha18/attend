import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';
import Attendance from '@/models/Attendance';
import { getUser, unauthorized } from '@/lib/auth';
import { getDistance } from '@/lib/geo';
import cloudinary from '@/lib/cloudinary';

// Increase body size limit for this specific route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export async function POST(request) {
  try {
    const user = getUser(request);
    if (!user || user.role !== 'STUDENT') {
      return unauthorized();
    }

    await dbConnect();

    const body = await request.json();
    const { latitude, longitude, selfieBase64 } = body;

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json({ message: 'Please provide GPS coordinates' }, { status: 400 });
    }

    if (!selfieBase64) {
      return NextResponse.json({ message: 'Live selfie is required' }, { status: 400 });
    }

    // Get active session
    const session = await Session.findOne({ active: true });
    if (!session) {
      return NextResponse.json({ message: 'No active session found. Ask your teacher to start a session.' }, { status: 404 });
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
      status: 'PRESENT',
      selfieUrl
    });

    return NextResponse.json({ message: 'Attendance marked successfully', attendance }, { status: 201 });

  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ message: 'Attendance already marked for today' }, { status: 400 });
    }
    console.error('Mark Attendance Error:', error);
    return NextResponse.json({ message: 'Server error: ' + error.message }, { status: 500 });
  }
}
