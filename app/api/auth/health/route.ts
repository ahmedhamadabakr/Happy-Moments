import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      );
    }

    await connectDB();
    const user = await User.findById(session.userId).select('firstName lastName email role phone');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: session.userId,
        email: session.email,
        role: session.role,
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        phone: user.phone,
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
