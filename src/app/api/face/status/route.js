import { NextResponse } from 'next/server';
import { getUser, unauthorized } from '@/lib/auth';
import { checkFaceStatus } from '@/lib/face';

export async function GET(request) {
  try {
    const user = getUser(request);
    if (!user || user.role !== 'STUDENT') {
      return unauthorized();
    }

    const result = await checkFaceStatus(user.userId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Face Status Error:', error);
    return NextResponse.json({ registered: false });
  }
}
