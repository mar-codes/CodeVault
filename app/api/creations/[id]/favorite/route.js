import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Creation from '@/schemas/Creations';
import connectToDb from '@/lib/connectDB';

export async function POST(request, context) {
  try {
    const params = await context.params;
    const id = params.id;
    
    if (!id) return NextResponse.json({ error: 'Missing creation ID' }, { status: 400 });

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    await connectToDb();
    const creation = await Creation.findById(id);
    if (!creation) return NextResponse.json({ error: 'Creation not found' }, { status: 404 });

    if (!creation.favoritedBy) creation.favoritedBy = [];
    if (!creation.favorites) creation.favorites = 0;

    const favoriteIndex = creation.favoritedBy.indexOf(userId);
    if (favoriteIndex > -1) {
      creation.favoritedBy.splice(favoriteIndex, 1);
      creation.favorites = Math.max(0, creation.favorites - 1);
    } else {
      creation.favoritedBy.push(userId);
      creation.favorites = creation.favorites + 1;
    }

    await creation.save();
    
    return NextResponse.json({ 
      success: true,
      isFavorited: favoriteIndex === -1,
      favorites: creation.favorites,
      favoritedBy: creation.favoritedBy
    });
  } catch (error) {
    console.error('Favorite toggle error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
