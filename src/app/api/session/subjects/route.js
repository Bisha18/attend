import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';
import { getUser, unauthorized } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = getUser(request);
    if (!user || user.role !== 'TEACHER') {
      return unauthorized();
    }

    await dbConnect();

    const subjects = await Session.distinct('subject', { teacherId: user.userId });
    // Filter out empty/null values
    const validSubjects = subjects.filter(Boolean);

    return NextResponse.json(validSubjects, { status: 200 });
  } catch (error) {
    console.error('Get Subjects Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
