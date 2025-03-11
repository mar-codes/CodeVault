import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Creation from '@/schemas/Creations';
import connectToDb from '@/lib/connectDB';

export async function GET() {
  try {
    await connectToDb();
    
    let userId = null;
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (err) {
        console.error('Token verification failed:', err);
      }
    }

    const creations = await Creation.find({
      privacy: { $in: ['public', 'unlisted'] }
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      creations,
      userId
    });
  } catch (error) {
    console.error('Error fetching creations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
