import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import User from '@/schemas/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const { avatarUrl } = await request.json();
    
    if (!avatarUrl) {
      return NextResponse.json({ error: "No avatar URL provided" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { $set: { avatar: avatarUrl } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user, message: "Avatar updated successfully" });
  } catch (error) {
    console.error('Error updating avatar:', error);
    return NextResponse.json({ error: "Failed to update avatar" }, { status: 500 });
  }
}
