import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    return NextResponse.json({
      authenticated: true,
      userId: decoded.userId,
      username: decoded.username 
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 401 });
  }
}
