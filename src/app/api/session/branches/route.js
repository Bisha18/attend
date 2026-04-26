import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';
import { getUser, unauthorized } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = getUser(request);
    if (!user) {
      return unauthorized();
    }

    await dbConnect();

    // Teachers see only their own branches; students see all
    const query = user.role === 'TEACHER' ? { teacherId: user.userId } : {};
    const branches = await Session.distinct('branch', query);
    // Filter out empty/null values
    const validBranches = branches.filter(Boolean);

    return NextResponse.json(validBranches, { status: 200 });
  } catch (error) {
    console.error('Get Subjects Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
