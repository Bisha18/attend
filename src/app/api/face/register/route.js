import { NextResponse } from 'next/server';
import { getUser, unauthorized } from '@/lib/auth';
import { registerFace } from '@/lib/face';

export async function POST(request) {
  try {
    const user = getUser(request);
    if (!user || user.role !== 'STUDENT') {
      return unauthorized();
    }

    const body = await request.json();
    const { selfieBase64 } = body;

    if (!selfieBase64) {
      return NextResponse.json({ message: 'Live selfie is required' }, { status: 400 });
    }

    const faceResult = await registerFace(user.userId, selfieBase64);

    if (faceResult && faceResult.success === false) {
      return NextResponse.json({
        message: `Face registration failed: ${faceResult.message}`,
      }, { status: 400 });
    }

    return NextResponse.json({
      message: 'Face registered successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Face Registration Error:', error);
    return NextResponse.json({ message: 'Server error: ' + error.message }, { status: 500 });
  }
}
