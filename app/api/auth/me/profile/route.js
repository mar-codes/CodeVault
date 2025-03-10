import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import User from '@/schemas/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectDB();

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const data = await request.json();
    console.log('Raw received data:', data);

    await connectDB();

    const currentUser = await User.findById(decoded.userId);
    
    let avatarToUse = currentUser.avatar; // Default to current avatar
    
    if (data.avatar && data.avatar.trim() !== '') {
      avatarToUse = data.avatar;
    }
    
    console.log('Avatar to use:', avatarToUse);

    const allowedUpdates = {
      username: data.username,
      email: data.email,
      bio: data.bio,
      website: data.website,
      github: data.github,
      twitter: data.twitter,
      location: data.location,
      skills: data.skills,
      displayName: data.displayName,
      bannerColor: data.bannerColor,
      avatar: avatarToUse
    };

    Object.keys(allowedUpdates).forEach(key => {
      if (allowedUpdates[key] === undefined) {
        delete allowedUpdates[key];
      }
    });

    console.log('Final updates to apply:', allowedUpdates);

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    ).select('-password');

    console.log('Updated user avatar:', user.avatar);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
