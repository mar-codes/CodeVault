import { NextResponse } from 'next/server';
import argon2 from 'argon2';
import crypto from 'node:crypto'
import connectDB from '@/lib/connectDB';
import User from '@/schemas/User';

export async function POST(request) {
  try {
    const { username, email, password } = await request.json();

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Check if user already exists
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return NextResponse.json(
        { message: 'Email already in use' },
        { status: 409 }
      );
    }

    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return NextResponse.json(
        { message: 'Username already taken' },
        { status: 409 }
      );
    }

    const salt = crypto.randomBytes(32);
    const hashedPassword = await argon2.hash(password, {
        type: argon2.argon2id,
        salt
    })

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      creations: []
    });

    await newUser.save();

    return NextResponse.json(
      { message: 'User registered successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
