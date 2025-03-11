import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Creation from '@/schemas/Creations';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import User from '@/schemas/User';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Creation ID is required' }, { status: 400 });

    await connectDB();
    const creationId = new mongoose.Types.ObjectId(id);
    const creation = await Creation.findById(creationId);
    if (!creation) return NextResponse.json({ error: 'Creation not found' }, { status: 404 });

    const cookieStore = await cookies();
    const token = await cookieStore.get('auth_token')?.value;
    let isOwner = false;

    if (creation.isPrivate) {
      if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = new mongoose.Types.ObjectId(decoded.userId);
        const user = await User.findById(userId);
        const userCreationIds = user.creations.map(cId => cId.toString());

        if (!user || !userCreationIds.includes(creationId.toString())) {
          return NextResponse.json({ error: 'Unauthorized to view this creation' }, { status: 403 });
        }
      } catch (error) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        isOwner = creation.owner === decoded.userId;
      } catch (error) {
        console.error('Token verification failed:', error);
      }
    }

    if (!isOwner) {
      await Creation.findByIdAndUpdate(creationId, { $inc: { views: 1 } });
    }

    return NextResponse.json({ creation });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const token = cookies().get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectDB();

    const user = await User.findById(decoded.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { title, description, code, language } = await request.json();
    const creation = await Creation.findById(params.id);
    if (!creation) return NextResponse.json({ error: 'Creation not found' }, { status: 404 });

    if (!user.creations.includes(creation._id)) {
      return NextResponse.json({ error: 'Unauthorized to edit this creation' }, { status: 403 });
    }

    const updatedCreation = await Creation.findByIdAndUpdate(
      params.id,
      {
        title,
        description,
        code,
        language,
        'metadata.lastModified': new Date(),
        'metadata.lines': code.split('\n').length,
        'metadata.characters': code.length,
      },
      { new: true }
    );

    return NextResponse.json({ creation: updatedCreation });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const token = cookies().get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.userId) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    await connectDB();

    const creation = await Creation.findById(params.id);
    if (!creation) return NextResponse.json({ error: 'Creation not found' }, { status: 404 });

    if (creation.owner !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized to delete this creation' }, { status: 403 });
    }

    await Creation.findByIdAndDelete(params.id);
    await User.findByIdAndUpdate(
      decoded.userId,
      { $pull: { creations: params.id } }
    );

    return NextResponse.json({ message: 'Creation deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}