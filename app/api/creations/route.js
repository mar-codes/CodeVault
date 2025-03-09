import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/connectDB';
import Creation from '@/schemas/Creations';
import User from '@/schemas/User';

export async function POST(request) {
  try {
    const { 
      title, 
      description, 
      code,
      language = 'plaintext', // Set default but allow override
      metadata
    } = await request.json();
    
    if (!title || !description || !code) {
      return NextResponse.json(
        { message: 'Title, description, and code are required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    let userId = null;
    let username = null;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;

        const user = await User.findById(userId);
        if (user) {
          username = user.username;
        }
      } catch (error) {
        console.error('Token verification failed:', error);
      }
    }
    
    const creationData = {
      title,
      description,
      code,
      language: language.toLowerCase(), // Normalize the language name
      metadata: {
        lines: metadata?.lines || code.split('\n').length,
        characters: metadata?.characters || code.length,
        lastModified: new Date()
      },
      status: 'public'
    };
    
    if (username) {
      creationData.author = username;
    }
    
    const creation = await Creation.create(creationData);
    
    if (userId) {
      await User.findByIdAndUpdate(
        userId,
        { $push: { creations: creation._id } },
        { new: true }
      );
    }
    
    return NextResponse.json({ 
      message: 'Creation saved successfully',
      id: creation._id,
      creation 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error saving creation:', error);
    return NextResponse.json(
      { message: 'Error saving creation' },
      { status: 500 }
    );
  }
}
