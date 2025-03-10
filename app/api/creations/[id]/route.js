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
    
    if (!id) {
      return NextResponse.json({ error: 'Creation ID is required' }, { status: 400 });
    }

    await connectDB();

    const creationId = new mongoose.Types.ObjectId(id);
    const creation = await Creation.findById(creationId);

    if (!creation) {
      return NextResponse.json({ error: 'Creation not found' }, { status: 404 });
    }

    if (creation.isPrivate) {
      const cookieStore = await cookies();
      const token = cookieStore.get('auth_token')?.value;

      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = new mongoose.Types.ObjectId(decoded.userId);
        
        const user = await User.findById(userId);
        
        // Convert user's creation IDs to strings for comparison
        const userCreationIds = user.creations.map(cId => cId.toString());
        
        if (!user || !userCreationIds.includes(creationId.toString())) {
          return NextResponse.json({ 
            error: 'Unauthorized to view this creation',
            debug: {
              userId: userId.toString(),
              creationId: creationId.toString(),
              userCreations: userCreationIds
            }
          }, { status: 403 });
        }
      } catch (error) {
        return NextResponse.json({ 
          error: 'Invalid token or authorization error',
          details: error.message
        }, { status: 401 });
      }
    }
    
    return NextResponse.json({ creation }, { status: 200 });
  } catch (error) {
    console.error('Error fetching creation:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const { title, description, code, language } = await request.json();
    
    const creation = await Creation.findById(params.id);
    if (!creation) {
      return NextResponse.json(
        { message: 'Creation not found' },
        { status: 404 }
      );
    }

    // Check if user owns this creation
    if (!user.creations.includes(creation._id)) {
      return NextResponse.json(
        { message: 'Unauthorized to edit this creation' },
        { status: 403 }
      );
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

    return NextResponse.json({ 
      message: 'Creation updated successfully',
      creation: updatedCreation 
    });

  } catch (error) {
    console.error('Error updating creation:', error);
    return NextResponse.json(
      { message: 'Error updating creation' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();
    
    const creation = await Creation.findById(id);
    if (!creation) {
      return NextResponse.json({ error: 'Creation not found' }, { status: 404 });
    }

    const creationUserId = creation.userId ? creation.userId.toString() : null;
    const decodedUserId = decoded.userId.toString();
    if (!creationUserId) {
      console.warn("Creation does not have userId set; falling back to allow deletion for decoded userId:", decodedUserId);
    } else if (creationUserId !== decodedUserId) {
      return NextResponse.json({ 
        error: 'Unauthorized to delete this creation',
        debug: {
          creationUserId,
          decodedUserId
        }
      }, { status: 403 });
    }

    await Creation.findByIdAndDelete(id);
    await User.findByIdAndUpdate(
      new mongoose.Types.ObjectId(decoded.userId),
      { $pull: { creations: new mongoose.Types.ObjectId(id) } }
    );

    return NextResponse.json({ message: 'Creation deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting creation:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}
